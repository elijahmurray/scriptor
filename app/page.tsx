"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { SkeletonCard } from '@/components/SkeletonCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Home() {
  const [transcript, setTranscript] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [summaryType, setSummaryType] = useState<string>('Quick Summary');

  useEffect(() => {
    if (summaryType) {
      generateSummary();
    }
  }, [summaryType]);

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

  const getPrompt = () => {
    switch (summaryType) {
      case 'Quick Summary':
        return 'Provide a quick summary of the following meeting transcript:';
      case 'Bullet Summary':
        return 'Provide a bullet-point summary of the following meeting transcript:';
      case 'Slack Update':
        return 'Provide a Slack update summary of the following meeting transcript:';
      case 'Detailed Summary':
        return 'Provide a detailed summary of the following meeting transcript:';
      default:
        return 'Provide a quick summary of the following meeting transcript:';
    }
  };

  const generateSummary = async () => {
    if (!transcript) return;

    setLoading(true);
    setError(null);
    setSummary('');

    try {
      const chunkSize = 16000;
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
            prompt: `${getPrompt()}\n${chunk}`,
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
        <p className="text-lg mt-12 mb-5 text-left">What type of summary do you need?</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {['Quick Summary', 'Bullet Summary', 'Slack Update', 'Detailed Summary'].map((type) => (
            <Button
              key={type}
              onClick={() => {
                setSummaryType(type);
              }}
              className="bg-black hover:bg-blue-100 hover:text-black border border-black text-white py-2 px-4 rounded"
              disabled={!fileName || loading}
            >
              {loading && summaryType === type ? <Spinner /> : type}
            </Button>
          ))}
        </div>
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
            <div className="mt-4 prose max-w-full">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summary}
              </ReactMarkdown>
            </div>
          )}
          {error && (
            <Alert className="mt-4 text-red-500">{error}</Alert>
          )}
        </div>
      )}
    </div>
  );
}