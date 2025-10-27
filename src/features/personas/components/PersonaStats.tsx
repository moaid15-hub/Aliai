// src/components/personas/PersonaStats.tsx
'use client';

import React from 'react';
import { PersonaStats as PersonaStatsType, Persona } from '@/features/personas/types/persona.types';
import { TrendingUp, Users, Star, Clock, Eye, Heart } from 'lucide-react';

interface PersonaStatsProps {
  stats: PersonaStatsType;
  className?: string;
}

export default function PersonaStats({ stats, className = '' }: PersonaStatsProps) {
  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    color = 'purple' 
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'purple' | 'blue' | 'green' | 'yellow' | 'red';
  }) => {
    const colorClasses = {
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PersonaCard = ({ persona, rank }: { persona: Persona; rank: number }) => (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold text-sm">
        {rank}
      </div>
      <div className="text-2xl">{persona.avatar}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white truncate">
          {persona.name}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {persona.usage_count} استخدام
        </p>
      </div>
      {persona.rating > 0 && (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-current text-yellow-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {persona.rating.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="إجمالي الشخصيات"
          value={stats.total_personas}
          color="purple"
        />
        <StatCard
          icon={Eye}
          title="شخصيات عامة"
          value={stats.public_personas}
          subtitle={`${Math.round((stats.public_personas / stats.total_personas) * 100)}% من الإجمالي`}
          color="blue"
        />
        <StatCard
          icon={Heart}
          title="شخصيات خاصة"
          value={stats.private_personas}
          subtitle={`${Math.round((stats.private_personas / stats.total_personas) * 100)}% من الإجمالي`}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="إجمالي الاستخدامات"
          value={stats.most_used.reduce((sum, persona) => sum + persona.usage_count, 0)}
          color="yellow"
        />
      </div>

      {/* Most Used Personas */}
      {stats.most_used.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              الأكثر استخداماً
            </h3>
          </div>
          <div className="space-y-2">
            {stats.most_used.slice(0, 5).map((persona, index) => (
              <PersonaCard key={persona.id} persona={persona} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Created */}
      {stats.recently_created.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              الأحدث إنشاءً
            </h3>
          </div>
          <div className="space-y-2">
            {stats.recently_created.slice(0, 5).map((persona, index) => (
              <div key={persona.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-2xl">{persona.avatar}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {persona.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(persona.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {persona.usage_count} استخدام
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          توزيع الفئات
        </h3>
        <div className="space-y-3">
          {Object.entries(
            [...stats.most_used, ...stats.recently_created].reduce((acc, persona) => {
              acc[persona.category] = (acc[persona.category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {category}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(count / Math.max(...Object.values(
                        [...stats.most_used, ...stats.recently_created].reduce((acc, persona) => {
                          acc[persona.category] = (acc[persona.category] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ))) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-left">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

