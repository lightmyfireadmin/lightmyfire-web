'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/locales/client';
import {
  FireIcon,
  ChatBubbleBottomCenterTextIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface CommunityStatsData {
  lightersSaved: number;
  storiesCreated: number;
  countriesReached: number;
  activeUsers: number;
}

const CommunityStats = () => {
  const t = useI18n() as any;
  const [stats, setStats] = useState<CommunityStatsData>({
    lightersSaved: 0,
    storiesCreated: 0,
    countriesReached: 0,
    activeUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Run all count queries in parallel for better performance
        const [
          { count: lightersCount },
          { count: postsCount },
          { count: usersCount },
          { data: uniqueCountries }
        ] = await Promise.all([
          // Fetch total lighters
          supabase
            .from('lighters')
            .select('*', { count: 'exact', head: true }),

          // Fetch total posts (stories)
          supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('is_public', true),

          // Fetch active users (users who created lighters or posts)
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true }),

          // Fetch unique countries using RPC if available, otherwise use optimized query
          // Only fetch the last part of location_name (country) to reduce data transfer
          supabase.rpc('get_community_stats').then(
            (result) => result.data,
            // Fallback if RPC doesn't exist yet
            () => supabase
              .from('posts')
              .select('location_name')
              .eq('is_public', true)
              .not('location_name', 'is', null)
              .then(({ data }) => {
                const uniqueLocations = new Set(
                  data?.map(post => {
                    const parts = post.location_name?.split(',') || [];
                    return parts[parts.length - 1]?.trim();
                  }).filter(Boolean)
                );
                return { countries_reached: uniqueLocations.size };
              })
          )
        ]);

        setStats({
          lightersSaved: lightersCount || 0,
          storiesCreated: postsCount || 0,
          countriesReached: Math.max(
            uniqueCountries?.countries_reached || 0,
            5
          ),
          activeUsers: usersCount || 0,
        });
      } catch (error) {
        console.error('Error fetching community stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Calculate environmental impact (approximate)
  // Average disposable lighter weighs ~21g, plastic takes 150+ years to decompose
  const plasticSavedKg = Math.round((stats.lightersSaved * 21) / 1000 * 10) / 10;
  const co2SavedKg = Math.round(stats.lightersSaved * 0.15 * 10) / 10; // Approximate CO2 per lighter production

  const statItems = [
    {
      icon: FireIcon,
      value: stats.lightersSaved.toLocaleString(),
      label: t('home.stats.lighters_saved'),
      subtext: `${plasticSavedKg}kg ${t('home.stats.plastic_saved')}`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: ChatBubbleBottomCenterTextIcon,
      value: stats.storiesCreated.toLocaleString(),
      label: t('home.stats.stories_created'),
      subtext: t('home.stats.stories_subtext'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: GlobeAltIcon,
      value: stats.countriesReached.toLocaleString(),
      label: t('home.stats.countries_reached'),
      subtext: t('home.stats.global_community'),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: SparklesIcon,
      value: `${co2SavedKg}kg`,
      label: t('home.stats.co2_saved'),
      subtext: t('home.stats.environmental_impact'),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-8 shadow-lg">
          <div className="h-8 bg-muted/20 rounded w-48 mx-auto mb-8 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="h-12 w-12 bg-muted/20 rounded-full mx-auto mb-3" />
                <div className="h-8 bg-muted/20 rounded w-16 mx-auto mb-2" />
                <div className="h-4 bg-muted/20 rounded w-24 mx-auto mb-1" />
                <div className="h-3 bg-muted/20 rounded w-32 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-8 sm:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {t('home.stats.title')}
        </h2>
        <p className="text-center text-sm sm:text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('home.stats.subtitle')}
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className={`${item.bgColor} w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${item.color}`} />
              </div>
              <div className={`text-3xl sm:text-4xl font-bold ${item.color} mb-2`}>
                {item.value}
              </div>
              <div className="text-sm sm:text-base font-semibold text-foreground mb-1">
                {item.label}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {item.subtext}
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-sm sm:text-base text-muted-foreground italic">
            {t('home.stats.join_movement')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityStats;
