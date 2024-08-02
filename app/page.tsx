"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import { SkeletonCard } from '@/components/SkeletonCard';

export default function Home() {
  const [transcript, setTranscript] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setTranscript(reader.result as string);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setTranscript(reader.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  const generateSummary = async () => {
    setLoading(true);
    setError(null);
    setSummary('');

    try {
      const chunkSize = 4000;
      const chunks = [];
      for (let i = 0; i < transcript.length; i += chunkSize) {
        chunks.push(transcript.slice(i, i + chunkSize));
      }

      let combinedSummary = '';

      for (const chunk of chunks) {
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: chunk,
            max_tokens: 200,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          combinedSummary += data.choices[0].message.content.trim() + '\n';
        } else {
          throw new Error('Unexpected API response format');
        }
      }

      setSummary(combinedSummary);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card
        className={`p-6 text-center bg-gray-100 cursor-pointer ${fileName ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
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
        <p className='text-gray-400 text-sm'>{fileName ? fileName : 'Drag & drop your transcript here or click to browse'}</p>
      </Card>
      <div className="mt-4 text-center">
        <Button onClick={generateSummary} className="bg-black hover:bg-blue-100 hover:text-black border border-black text-white py-2 px-4 rounded w-full" disabled={!fileName || loading}>
          {loading ? <Spinner /> : 'Generate Summary'}
        </Button>
        <hr className='m-12' />
      </div>
      {transcript && (
        <div className="mt-4">
          {loading && (
            <div className="mt-4">
              <SkeletonCard />
            </div>
          )}
          {summary && (
            <Textarea className="mt-4 w-full h-64 border border-gray-300 p-2" readOnly value={summary}></Textarea>
          )}
          {error && (
            <Alert className="mt-4 text-red-500">{error}</Alert>
          )}
        </div>
      )}
    </div>
  );
}