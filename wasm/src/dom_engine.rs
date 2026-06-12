use serde::{Serialize, Deserialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, PartialEq, TS, Clone)]
#[ts(export)]
pub enum DomNode {
    Element {
        tag: String,
        attrs: Vec<(String, String)>,
        children: Vec<DomNode>,
    },
    Text(String),
}

#[derive(Serialize, Deserialize, Debug, PartialEq, TS, Clone)]
#[ts(export)]
pub enum DomInstruction {
    CreateElement { id: String, tag: String },
    SetAttribute { id: String, attr: String, value: String },
    RemoveAttribute { id: String, attr: String },
    SetText { id: String, text: String },
    AppendChild { parent_id: String, child_id: String },
    RemoveChild { parent_id: String, child_id: String },
    ReplaceChild { parent_id: String, old_id: String, new_id: String },
}

pub struct HtmlParser {
    input: Vec<char>,
    pos: usize,
}

impl HtmlParser {
    pub fn new(html: &str) -> Self {
        HtmlParser {
            input: html.chars().collect(),
            pos: 0,
        }
    }

    fn eof(&self) -> bool {
        self.pos >= self.input.len()
    }

    fn peek(&self) -> char {
        if self.eof() {
            '\0'
        } else {
            self.input[self.pos]
        }
    }

    fn consume(&mut self) -> char {
        let c = self.peek();
        self.pos += 1;
        c
    }

    fn consume_while<F>(&mut self, test: F) -> String
    where
        F: Fn(char) -> bool,
    {
        let mut result = String::new();
        while !self.eof() && test(self.peek()) {
            result.push(self.consume());
        }
        result
    }

    fn skip_whitespace(&mut self) {
        self.consume_while(|c| c.is_whitespace());
    }

    pub fn parse_nodes(&mut self) -> Vec<DomNode> {
        let mut nodes = Vec::new();
        while !self.eof() {
            self.skip_whitespace();
            if self.eof() {
                break;
            }
            if self.peek() == '<' {
                if self.pos + 1 < self.input.len() && self.input[self.pos + 1] == '/' {
                    // Stop parsing children at this level
                    break;
                }
                if self.pos + 3 < self.input.len()
                    && &self.input[self.pos..self.pos + 4] == &['<', '!', '-', '-']
                {
                    // Skip comment
                    self.pos += 4;
                    while !self.eof() {
                        if self.pos + 2 < self.input.len()
                            && &self.input[self.pos..self.pos + 3] == &['-', '-', '>']
                        {
                            self.pos += 3;
                            break;
                        }
                        self.consume();
                    }
                    continue;
                }
                if let Some(node) = self.parse_element() {
                    nodes.push(node);
                }
            } else {
                let text = self.consume_while(|c| c != '<');
                let trimmed = text.trim();
                if !trimmed.is_empty() {
                    nodes.push(DomNode::Text(trimmed.to_string()));
                }
            }
        }
        nodes
    }

    fn parse_element(&mut self) -> Option<DomNode> {
        self.consume(); // consume '<'
        let tag = self.consume_while(|c| c.is_alphanumeric() || c == '-' || c == '_');
        if tag.is_empty() {
            return None;
        }

        let mut attrs = Vec::new();
        self.skip_whitespace();
        while !self.eof() && self.peek() != '>' && self.peek() != '/' {
            if let Some((name, val)) = self.parse_attribute() {
                attrs.push((name, val));
            }
            self.skip_whitespace();
        }

        let is_self_closing = if self.peek() == '/' {
            self.consume();
            true
        } else {
            false
        };

        if self.peek() == '>' {
            self.consume();
        }

        let mut children = Vec::new();
        if !is_self_closing && !is_void_element(&tag) {
            children = self.parse_nodes();
            // consume close tag </tag>
            self.skip_whitespace();
            if self.peek() == '<' {
                self.consume(); // '<'
                if self.peek() == '/' {
                    self.consume(); // '/'
                    let _close_tag =
                        self.consume_while(|c| c.is_alphanumeric() || c == '-' || c == '_');
                    self.skip_whitespace();
                    if self.peek() == '>' {
                        self.consume(); // '>'
                    }
                }
            }
        }

        Some(DomNode::Element {
            tag,
            attrs,
            children,
        })
    }

    fn parse_attribute(&mut self) -> Option<(String, String)> {
        let name =
            self.consume_while(|c| c != '=' && !c.is_whitespace() && c != '>' && c != '/');
        if name.is_empty() {
            return None;
        }
        self.skip_whitespace();
        if self.peek() != '=' {
            return Some((name, String::new()));
        }
        self.consume(); // '='
        self.skip_whitespace();
        let val = if self.peek() == '"' || self.peek() == '\'' {
            let quote = self.consume();
            let val = self.consume_while(|c| c != quote);
            self.consume(); // consume matching quote
            val
        } else {
            self.consume_while(|c| !c.is_whitespace() && c != '>')
        };
        Some((name, val))
    }
}

fn is_void_element(tag: &str) -> bool {
    matches!(
        tag.to_lowercase().as_str(),
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

pub fn diff(old_tree: &DomNode, new_tree: &DomNode) -> Vec<DomInstruction> {
    let mut instructions = Vec::new();
    diff_recursive(old_tree, new_tree, "", &mut instructions);
    instructions
}

fn diff_recursive(
    old_node: &DomNode,
    new_node: &DomNode,
    path: &str,
    insts: &mut Vec<DomInstruction>,
) {
    match (old_node, new_node) {
        (DomNode::Text(old_text), DomNode::Text(new_text)) => {
            if old_text != new_text {
                insts.push(DomInstruction::SetText {
                    id: path.to_string(),
                    text: new_text.clone(),
                });
            }
        }
        (
            DomNode::Element {
                tag: old_tag,
                attrs: old_attrs,
                children: old_children,
            },
            DomNode::Element {
                tag: new_tag,
                attrs: new_attrs,
                children: new_children,
            },
        ) => {
            if old_tag != new_tag {
                let parent_path = get_parent_path(path);
                insts.push(DomInstruction::ReplaceChild {
                    parent_id: parent_path.to_string(),
                    old_id: path.to_string(),
                    new_id: path.to_string(),
                });
                return;
            }

            // Remove stale attributes
            for (name, _) in old_attrs {
                if !new_attrs.iter().any(|(n, _)| n == name) {
                    insts.push(DomInstruction::RemoveAttribute {
                        id: path.to_string(),
                        attr: name.clone(),
                    });
                }
            }

            // Set/update attributes
            for (name, value) in new_attrs {
                if let Some((_, old_val)) = old_attrs.iter().find(|(n, _)| n == name) {
                    if old_val != value {
                        insts.push(DomInstruction::SetAttribute {
                            id: path.to_string(),
                            attr: name.clone(),
                            value: value.clone(),
                        });
                    }
                } else {
                    insts.push(DomInstruction::SetAttribute {
                        id: path.to_string(),
                        attr: name.clone(),
                        value: value.clone(),
                    });
                }
            }

            // Diff children
            let old_len = old_children.len();
            let new_len = new_children.len();
            let common_len = std::cmp::min(old_len, new_len);

            for i in 0..common_len {
                let child_path = if path.is_empty() {
                    i.to_string()
                } else {
                    format!("{}/{}", path, i)
                };
                diff_recursive(&old_children[i], &new_children[i], &child_path, insts);
            }

            // Append extra children
            if new_len > old_len {
                for i in old_len..new_len {
                    let child_path = if path.is_empty() {
                        i.to_string()
                    } else {
                        format!("{}/{}", path, i)
                    };
                    generate_create_instructions(&new_children[i], &child_path, path, insts);
                }
            }
            // Remove missing children
            else if old_len > new_len {
                for i in new_len..old_len {
                    let child_path = if path.is_empty() {
                        i.to_string()
                    } else {
                        format!("{}/{}", path, i)
                    };
                    insts.push(DomInstruction::RemoveChild {
                        parent_id: path.to_string(),
                        child_id: child_path,
                    });
                }
            }
        }
        (_, _) => {
            let parent_path = get_parent_path(path);
            insts.push(DomInstruction::ReplaceChild {
                parent_id: parent_path.to_string(),
                old_id: path.to_string(),
                new_id: path.to_string(),
            });
        }
    }
}

fn get_parent_path(path: &str) -> &str {
    if let Some(idx) = path.rfind('/') {
        &path[..idx]
    } else {
        ""
    }
}

fn generate_create_instructions(
    node: &DomNode,
    path: &str,
    parent_path: &str,
    insts: &mut Vec<DomInstruction>,
) {
    match node {
        DomNode::Text(text) => {
            insts.push(DomInstruction::CreateElement {
                id: path.to_string(),
                tag: "#text".to_string(),
            });
            insts.push(DomInstruction::SetText {
                id: path.to_string(),
                text: text.clone(),
            });
            insts.push(DomInstruction::AppendChild {
                parent_id: parent_path.to_string(),
                child_id: path.to_string(),
            });
        }
        DomNode::Element {
            tag,
            attrs,
            children,
        } => {
            insts.push(DomInstruction::CreateElement {
                id: path.to_string(),
                tag: tag.clone(),
            });
            for (name, val) in attrs {
                insts.push(DomInstruction::SetAttribute {
                    id: path.to_string(),
                    attr: name.clone(),
                    value: val.clone(),
                });
            }
            for (i, child) in children.iter().enumerate() {
                let child_path = format!("{}/{}", path, i);
                generate_create_instructions(child, &child_path, path, insts);
            }
            insts.push(DomInstruction::AppendChild {
                parent_id: parent_path.to_string(),
                child_id: path.to_string(),
            });
        }
    }
}
