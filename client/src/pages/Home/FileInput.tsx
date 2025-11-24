import { useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

type FileInputProps = {
    files: Array<File>;
    preview: boolean;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>)  => void;
    sendFiles: () => void;
}
export default function FileInput({ files, preview, handleFileChange, sendFiles }: FileInputProps) {

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (files.length === 0 && inputRef?.current) {
      inputRef.current.value = "";
    }
  }, [files])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="file" className="text-sm font-medium text-foreground">
          Select Files
        </Label>
        <div className="relative">
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            multiple={true}
            ref={inputRef}
          />
        </div>
      </div>

      {/* Thumbnail Preview */}
      {preview && files?.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {files?.map((file: File) => (
              <div key={file.name} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full aspect-square object-cover rounded-lg border border-border shadow-sm transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="default"
        onClick={sendFiles}
        disabled={files.length === 0}
        className="w-full mt-6 h-11 font-medium shadow-sm hover:shadow transition-shadow"
      >
        {files.length > 0 ? `Send ${files.length} File${files.length > 1 ? 's' : ''}` : 'Send Files'}
      </Button>
    </div>
  );
}
