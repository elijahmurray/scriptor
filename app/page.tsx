"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';


export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setTranscript(reader.result as string);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const generateSummary = async () => {
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
            prompt: `Summarize the following meeting transcript:\n${chunk}`,
            max_tokens: 200,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          combinedSummary += data.choices[0].text.trim() + '\n';
        } else {
          throw new Error('Unexpected API response format');
        }
      }

      setSummary(combinedSummary);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6 text-center border-dashed border-2 border-gray-400" onDrop={handleDrop} onDragOver={handleDragOver}>
        <p>Drag & drop your transcript here</p>
      </Card>
      {transcript && (
        <div className="mt-4">
          <Button onClick={generateSummary} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Generate Summary
          </Button>
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