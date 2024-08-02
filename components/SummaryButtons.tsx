import React from 'react';
import { Button } from '@/components/ui/button';

interface SummaryButtonsProps {
    fileName: string | null;
    loading: boolean;
    generateSummary: (type: string) => void;
    summaryType: string;
}

const SummaryButtons: React.FC<SummaryButtonsProps> = ({ fileName, loading, generateSummary, summaryType }) => {
    const types = ['Quick Summary', 'Bullet Summary', 'Slack Update', 'Detailed Summary'];

    return (
        <div className="mt-4 text-center">
            <p className="text-lg font-semibold mb-2">Generate:</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {types.map((type) => (
                    <Button
                        key={type}
                        onClick={() => generateSummary(type)}
                        className="bg-black hover:bg-blue-100 hover:text-black border border-black text-white py-2 px-4 rounded"
                        disabled={!fileName || loading}
                    >
                        {loading && summaryType === type ? 'Loading...' : type}
                    </Button>
                ))}
            </div>
            <hr className="m-12" />
        </div>
    );
};

export default SummaryButtons;