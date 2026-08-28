import { ScenarioConfig } from '../types/game';
import { ALL_SCENARIOS } from './scenarios';

export interface PlaylistConfig {
  id: string;
  name: string;
  creator: string;
  description: string;
  tag: 'Valorant' | 'CS2' | 'Apex' | 'Overwatch' | 'All-Rounder';
  color: string;
  scenarioIds: string[];
}

export const PRO_PLAYLISTS: PlaylistConfig[] = [
  {
    id: 'tenz_valorant_warmup',
    name: 'TenZ Valorant God Routine',
    creator: 'TenZ (Sentinels)',
    description: 'The ultimate 4-stage routine for micro-flicks, headshot angle clearance, and dynamic target transitions.',
    tag: 'Valorant',
    color: '#ff4655',
    scenarioIds: ['gridshot_ultimate', 'reflex_shot_pro', 'sixshot_precision', 'adad_strafe_duel']
  },
  {
    id: 's1mple_cs2_flick',
    name: 's1mple CS2 Headshot Precision',
    creator: 's1mple (Navi)',
    description: 'High-precision micro-clicking, pre-aim deadzoning, and rapid recoil reset drills.',
    tag: 'CS2',
    color: '#de9b35',
    scenarioIds: ['spidershot_elite', 'micro_flick_master', 'headshot_line_trainer', 'humanoid_strafers']
  },
  {
    id: 'shroud_apex_smoothness',
    name: 'Shroud Apex Tracking & Smoothness',
    creator: 'Shroud',
    description: 'Continuous beam tracking and vertical target switching for high-mobility battle royales.',
    tag: 'Apex',
    color: '#a855f7',
    scenarioIds: ['smoothness_360', 'thin_shaft_tracking', 'pattargetswitch_speed', 'fast_bounce_track']
  },
  {
    id: 'aimlab_daily_benchmark',
    name: 'Esports All-Rounder Benchmark',
    creator: 'AIMPRO Lab',
    description: 'Complete 5-stage benchmark test covering Clicking, Tracking, Switching, Reaction Speed, and Strafing.',
    tag: 'All-Rounder',
    color: '#00f0ff',
    scenarioIds: ['gridshot_ultimate', 'sphere_track_invincible', 'pattargetswitch_speed', 'reflex_shot_pro', 'adad_strafe_duel']
  }
];
