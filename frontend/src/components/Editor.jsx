import { useEffect, useMemo } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import debounce from "lodash.debounce";
import "@blocknote/mantine/style.css";


export default function Editor({ content, onContentChange,readOnly=false }) {
  // ✅ Initialize editor with initial content
  const editor = useCreateBlockNote({
    initialContent: content ? JSON.parse(content) : undefined,
  });
  console.log("inside editor",content);
  
  // ✅ Debounced autosave
  const debouncedOnChange = useMemo(
    () =>
      debounce((updatedEditor) => {
        const currentContent = JSON.stringify(updatedEditor.topLevelBlocks);
        onContentChange(currentContent);
      }, 1000),
    [onContentChange]
  );
  // ✅ Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="p-4">
      <BlockNoteView
        editor={editor}
        theme="dark"
        editable={!readOnly} 
        onChange={() => {
          if (!readOnly) debouncedOnChange(editor); // prevent updates in view mode
        }}
      />
    </div>
  );
}
