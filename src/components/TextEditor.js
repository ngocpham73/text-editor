import React, { useState, useMemo, useCallback } from "react";
import { createEditor, Editor, Transforms } from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import { withHistory } from "slate-history";
import isHotkey from "is-hotkey";

const listType = ["numbered-list", "bulleted-list"];
const hotKey = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
};
const TextEditor = () => {
  const [value, setValue] = useState(initialize);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);
      }}
    >
      <div className="toolbar">
        <ButtonBlock format="heading1" icon="Heading" />
        <ButtonBlock format="numbered-list" icon="NL" />
        <ButtonBlock format="bulleted-list" icon="BL" />
        <ButtonMark format="bold" icon="B" />
        <ButtonMark format="italic" icon="I" />
        <ButtonMark format="underline" icon="U" />
      </div>
      <Editable
        placeholder="Say something..."
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          for (const key in hotKey) {
            if (isHotkey(key, event)) {
              event.preventDefault();
              toggleMark(editor, hotKey[key]);
            }
          }
        }}
      />
    </Slate>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = listType.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => listType.includes(n.type),
    split: true,
  });

  const newType = isActive ? "paragraph" : isList ? "list-item" : format;

  Transforms.setNodes(editor, { type: newType });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};
const Element = ({ attributes, element, children }) => {
  switch (element.type) {
    case "heading1":
      return <h1 {...attributes}>{children}</h1>;
    case "numbered-list":
      return <ol {...attributes}> {children} </ol>;
    case "bulleted-list":
      return <ul {...attributes}> {children} </ul>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, leaf, children }) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;

  return <span {...attributes}>{children}</span>;
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });
  return !!match;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const ButtonBlock = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <button
      className="buttonBlock"
      onClick={() => {
        toggleBlock(editor, format);
      }}
    >
      {icon}
    </button>
  );
};

const ButtonMark = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <button
      onClick={() => {
        toggleMark(editor, format);
      }}
    >
      {icon}
    </button>
  );
};

const initialize = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

export default TextEditor;
