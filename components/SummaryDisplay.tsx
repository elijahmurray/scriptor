import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AiOutlineCopy } from 'react-icons/ai';

interface SummaryDisplayProps {
    summary: string;
    error: string | null;
    loading: boolean;
    copyToClipboard: () => void;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, error, loading, copyToClipboard }) => {
    return (
        <div className="mt-4 relative">
            {loading && (
                <div className="mt-4">
                    <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-400 h-12 w-12"></div>
                        <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-400 rounded"></div>
                                <div className="h-4 bg-gray-400 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {summary && (
                <div className="mt-4 prose max-w-full">
                    <div className="flex justify-end">
                        <Button onClick={copyToClipboard} className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-2 rounded">
                            <AiOutlineCopy />
                        </Button>
                    </div>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {summary}
                    </ReactMarkdown>
                </div>
            )}
            {error && (
                <Alert className="mt-4 text-red-500">{error}</Alert>
            )}
        </div>
    );
};

export default SummaryDisplay;