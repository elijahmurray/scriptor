import React, { useRef } from 'react';
import { Card } from '@/components/ui/card';

interface FileUploadProps {
    onFileChange: (file: string, fileName: string) => void;
    fileName: string | null; // Add this prop to hold the uploaded file's name
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, fileName }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            onFileChange(reader.result as string, file.name);
        };
        reader.readAsText(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                onFileChange(reader.result as string, file.name);
            };
            reader.readAsText(file);
        }
    };

    const handleCardClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card
            className="p-6 text-center bg-gray-100 cursor-pointer hover:bg-gray-200"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleCardClick}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
            <p className="text-gray-400 text-sm">
                {fileName ? fileName : 'Drag & drop your transcript here or click to browse'}
            </p>
        </Card>
    );
};

export default FileUpload;