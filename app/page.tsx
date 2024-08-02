"use client";

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import SummaryButtons from '@/components/SummaryButtons';
import SummaryDisplay from '@/components/SummaryDisplay';
import { getPrompt } from '@/utils/prompts';

export default function Home() {
  const [transcript, setTranscript] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [summaryType, setSummaryType] = useState<string>('');

  const generateSummary = async (type: string) => {
    setSummaryType(type);
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
            prompt: `${getPrompt(type)}\n${chunk}`,
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary).then(() => {
      alert('Summary copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <FileUpload onFileChange={(file, fileName) => { setTranscript(file); setFileName(fileName); }} fileName={fileName} />
      <SummaryButtons fileName={fileName} loading={loading} generateSummary={generateSummary} summaryType={summaryType} />
      {transcript && (
        <SummaryDisplay summary={summary} error={error} loading={loading} copyToClipboard={copyToClipboard} />
      )}
    </div>
  );
}