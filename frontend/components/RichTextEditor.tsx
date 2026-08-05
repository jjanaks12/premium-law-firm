import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import MediaLibraryDialog from "@/components/MediaLibraryDialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  ListIcon,
  ListOrderedIcon,
  Heading1Icon,
  Heading2Icon,
  QuoteIcon,
  LinkIcon,
  UnlinkIcon,
  ImageIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-base dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none rounded-b-lg border-x border-b border-input bg-background",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleH1 = () =>
    editor.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleH2 = () =>
    editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleBulletList = () =>
    editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () =>
    editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () =>
    editor.chain().focus().toggleBlockquote().run();

  const handleLinkSubmit = () => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setIsLinkPopoverOpen(false);
  };

  const unsetLink = () => editor.chain().focus().unsetLink().run();

  const setAlignLeft = () => editor.chain().focus().setTextAlign("left").run();
  const setAlignCenter = () =>
    editor.chain().focus().setTextAlign("center").run();
  const setAlignRight = () =>
    editor.chain().focus().setTextAlign("right").run();
  const setAlignJustify = () =>
    editor.chain().focus().setTextAlign("justify").run();

  const openMediaLibrary = () => {
    setIsMediaOpen(true);
  };

  const ToolbarButton = ({ onClick, isActive, icon: Icon, disabled }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded hover:bg-muted transition-colors ${isActive ? "bg-muted text-primary" : "text-muted-foreground"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-1 p-1 border border-input bg-muted/20 rounded-t-lg">
        <ToolbarButton
          onClick={toggleBold}
          isActive={editor.isActive("bold")}
          icon={BoldIcon}
        />
        <ToolbarButton
          onClick={toggleItalic}
          isActive={editor.isActive("italic")}
          icon={ItalicIcon}
        />
        <ToolbarButton
          onClick={toggleStrike}
          isActive={editor.isActive("strike")}
          icon={StrikethroughIcon}
        />
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarButton
          onClick={toggleH1}
          isActive={editor.isActive("heading", { level: 1 })}
          icon={Heading1Icon}
        />
        <ToolbarButton
          onClick={toggleH2}
          isActive={editor.isActive("heading", { level: 2 })}
          icon={Heading2Icon}
        />
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarButton
          onClick={setAlignLeft}
          isActive={editor.isActive({ textAlign: "left" })}
          icon={AlignLeftIcon}
        />
        <ToolbarButton
          onClick={setAlignCenter}
          isActive={editor.isActive({ textAlign: "center" })}
          icon={AlignCenterIcon}
        />
        <ToolbarButton
          onClick={setAlignRight}
          isActive={editor.isActive({ textAlign: "right" })}
          icon={AlignRightIcon}
        />
        <ToolbarButton
          onClick={setAlignJustify}
          isActive={editor.isActive({ textAlign: "justify" })}
          icon={AlignJustifyIcon}
        />
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarButton
          onClick={toggleBulletList}
          isActive={editor.isActive("bulletList")}
          icon={ListIcon}
        />
        <ToolbarButton
          onClick={toggleOrderedList}
          isActive={editor.isActive("orderedList")}
          icon={ListOrderedIcon}
        />
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarButton
          onClick={toggleBlockquote}
          isActive={editor.isActive("blockquote")}
          icon={QuoteIcon}
        />
        <div className="w-px h-4 bg-border mx-1" />
        <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
          <PopoverTrigger
            className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("link") ? "bg-muted text-primary" : "text-muted-foreground"}`}
            onClick={() => setLinkUrl(editor.getAttributes("link").href || "")}
            type="button"
          >
            <LinkIcon size={16} />
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-3 flex gap-2"
            align="center"
            side="bottom"
          >
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLinkSubmit();
              }}
            />
            <Button onClick={handleLinkSubmit} size="sm">
              Save
            </Button>
          </PopoverContent>
        </Popover>
        <ToolbarButton
          onClick={unsetLink}
          disabled={!editor.isActive("link")}
          icon={UnlinkIcon}
        />
        <ToolbarButton onClick={openMediaLibrary} icon={ImageIcon} />
      </div>
      <EditorContent editor={editor} />

      <MediaLibraryDialog
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        getFileUrl={(url) => {
          if (url.startsWith("http")) return url;
          const host = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
            "/api/v1",
            "",
          );
          return `${host}${url}`;
        }}
        onSelect={(url, id) => {
          const host = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
            "/api/v1",
            "",
          );
          const fullUrl = url.startsWith("http") ? url : `${host}${url}`;
          editor.chain().focus().setImage({ src: fullUrl }).run();
          setIsMediaOpen(false);
        }}
      />
    </div>
  );
}
