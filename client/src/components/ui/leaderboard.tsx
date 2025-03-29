import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueryFn } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Clock, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardEntry {
  username: string;
  bestScore: number;
  bestTime: number;
  isRecordHolder: boolean;
}

interface LeaderboardProps {
  onRecordHolderClick?: (username: string) => void;
}

const formatTime = (timeMs: number): string => {
  const seconds = Math.floor(timeMs / 1000);
  const ms = timeMs % 1000;
  return `${seconds}.${ms.toString().padStart(3, '0')}s`;
};

export function Leaderboard({ onRecordHolderClick }: LeaderboardProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/leaderboard'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const leaderboard: LeaderboardEntry[] = data?.leaderboard || [];
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500">Failed to load leaderboard</p>
        </CardContent>
      </Card>
    );
  }
  
  const recordHolder = leaderboard.find(entry => entry.isRecordHolder);
  const hasSpeedRecord = recordHolder && recordHolder.bestTime <= 10000;

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recordHolder && (
          <div 
            className={`bg-gradient-to-r ${hasSpeedRecord ? 'from-blue-600 to-purple-600' : 'from-yellow-500 to-amber-600'} p-3 rounded-lg mb-4 text-white cursor-pointer transition-transform hover:scale-102 hover:shadow-md`}
            onClick={() => onRecordHolderClick && onRecordHolderClick(recordHolder.username)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Trophy className="h-6 w-6 mr-2 text-yellow-300" />
                <span className="font-bold">{recordHolder.username}</span>
                {hasSpeedRecord && (
                  <span className="ml-2 bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    SPEED KING
                  </span>
                )}
              </div>
              <div className="text-xs font-mono">
                <span className="mr-2"><Clock className="inline h-3 w-3 mr-1" />{formatTime(recordHolder.bestTime)}</span>
                <span>{recordHolder.bestScore} pts</span>
              </div>
            </div>
            {hasSpeedRecord && (
              <p className="text-xs mt-1 bg-black bg-opacity-20 p-1 rounded">
                <Zap className="inline h-3 w-3 mr-1" />
                Break this record in under 10 seconds to earn tokens with fewer ads!
              </p>
            )}
          </div>
        )}
        
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No scores yet. Be the first to set a record!
          </p>
        ) : (
          <div className="grid grid-cols-[auto_1fr_auto] gap-2">
            <div className="font-semibold text-gray-500">#</div>
            <div className="font-semibold text-gray-500">Player</div>
            <div className="font-semibold text-gray-500 text-right">Score</div>
            
            {leaderboard.map((entry, index) => (
              <React.Fragment key={entry.username}>
                <div className="flex items-center">
                  {index === 0 ? (
                    <Medal className="h-4 w-4 text-yellow-500" />
                  ) : index === 1 ? (
                    <Medal className="h-4 w-4 text-gray-400" />
                  ) : index === 2 ? (
                    <Medal className="h-4 w-4 text-amber-700" />
                  ) : (
                    <span className="text-gray-500">{index + 1}</span>
                  )}
                </div>
                <div className="font-medium">
                  {entry.username}
                  {entry.isRecordHolder && <span className="text-yellow-500 ml-1">👑</span>}
                </div>
                <div className="text-right text-sm">
                  <span className="font-mono font-medium">{entry.bestScore}</span>
                  <span className="text-gray-500 text-xs ml-1">
                    ({formatTime(entry.bestTime)})
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}