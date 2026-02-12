import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/apiService';
import { formatCurrency } from '@/lib/formatter';

const fetchRewards = async () => {
  const response = await get('/rewards');
  return response;
};

const RewardList = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['getRewards'],
    queryFn: fetchRewards,
  });

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError) return <p className="p-4 text-red-500">Error fetching data</p>;

  const member = data?.member || {};
  const REWARDS_COMMISSIONS = data?.REWARDS_COMMISSIONS || [];

  const nextReward = REWARDS_COMMISSIONS.find(
    (reward) => reward.rewardLevel > (member?.goldRewardLevel || 0)
  );

  return (
    <div className="mt-4 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">
        🎖️ Rewards Dashboard
      </h1>

      {/* Gold Reward Summary */}
      <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">Reward Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm">Current Level</p>
              <p className="text-2xl font-bold">{member?.goldRewardLevel}</p>
            </div>
            <div>
              <p className="text-sm">Reward Income This Month</p>
              <p className="text-2xl font-bold">
                {formatCurrency(member?.goldRewardIncome || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm">Silver Pairs Matched</p>
              <p className="text-2xl font-bold">
                {member?.goldRewardBalance || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Reward Level */}
      {nextReward && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-2">
              🚀 Next Reward to Achieve
            </h2>
            <p className="text-sm">Level: {nextReward.rewardLevel}</p>
            <p className="text-sm">Pairs Required: {nextReward.pair}</p>
            <p className="text-sm">
              Reward Amount: {formatCurrency(nextReward.amount)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* All Reward Levels */}
      <h2 className="text-lg font-semibold mb-3 text-gray-700">
        📊 All Silver Reward Levels
      </h2>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4">
          {REWARDS_COMMISSIONS.map((reward, index) => {
            const isAchieved = reward.rewardLevel <= member?.goldRewardLevel;
            const isCurrent = reward.rewardLevel === member?.goldRewardLevel;
            return (
              <Card
                key={index}
                className={`min-w-[200px] flex-shrink-0 p-4 text-white transition-transform hover:scale-[1.02] ${
                  isAchieved
                    ? 'bg-gradient-to-br from-green-400 to-green-600'
                    : 'bg-gradient-to-br from-gray-400 to-gray-600 opacity-80'
                }`}
              >
                <CardContent className="p-0">
                  <h3 className="text-md font-bold mb-2">{reward.name}</h3>
                  <p className="text-sm">Level: {reward.rewardLevel}</p>
                  <p className="text-sm">Pairs: {reward.pair}</p>
                  <p className="text-sm">
                    Amount: {formatCurrency(reward.amount)}
                  </p>
                  {isAchieved && (
                    <Badge
                      className={`mt-2 ${
                        isCurrent
                          ? 'bg-white text-yellow-700'
                          : 'bg-white text-green-700'
                      }`}
                    >
                      {isCurrent ? 'Current' : 'Achieved'}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RewardList;
