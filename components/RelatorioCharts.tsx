'use client';

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface GrupoData { grupo: string; inicial: number; atual: number; }
interface HabitoRuimData { habito: string; inicial: number; atual: number; }
interface RadarData { dim: string; atual: number; anterior: number; }
interface PesoData { data: string; peso?: number; }

/* eslint-disable @typescript-eslint/no-explicit-any */

const COLORS_GRUPOS = ['#10b981', '#059669', '#047857', '#065f46', '#34d399', '#6ee7b7'];
const COLORS_RUINS_INICIAL = '#f87171';
const COLORS_RUINS_ATUAL = '#4ade80';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f0ede8', backdropFilter: 'blur(8px)' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#28251f', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: '#7d7670' }}>{p.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function CustomTooltipHabitos({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f0ede8' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#28251f', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: '#7d7670' }}>{p.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.value}x/sem</span>
        </div>
      ))}
    </div>
  );
}

export function GruposAlimentaresChart({ data }: { data: GrupoData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barGap={2} barCategoryGap="20%">
        <defs>
          <linearGradient id="gradInicial" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
          </linearGradient>
          <linearGradient id="gradAtual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f0e8" vertical={false} />
        <XAxis dataKey="grupo" fontSize={12} stroke="#9c9588" axisLine={false} tickLine={false} dy={8} />
        <YAxis domain={[0, 10]} fontSize={10} stroke="#ccc" axisLine={false} tickLine={false} dx={-4} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: 12 }} iconType="circle" iconSize={8} />
        <Bar dataKey="inicial" name="Avaliação Inicial" fill="url(#gradInicial)" radius={[8, 8, 0, 0]} animationDuration={800} />
        <Bar dataKey="atual" name="Avaliação Atual" fill="url(#gradAtual)" radius={[8, 8, 0, 0]} animationDuration={800} animationBegin={200} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HabitosInadequadosChart({ data }: { data: HabitoRuimData[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={2} barCategoryGap="20%">
        <defs>
          <linearGradient id="gradRuimInicial" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fca5a5" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="gradRuimAtual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f0e8" vertical={false} />
        <XAxis dataKey="habito" fontSize={11} stroke="#9c9588" axisLine={false} tickLine={false} dy={8} />
        <YAxis domain={[0, 7]} fontSize={10} stroke="#ccc" axisLine={false} tickLine={false} unit="x" dx={-4} />
        <Tooltip content={<CustomTooltipHabitos />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: 12 }} iconType="circle" iconSize={8} />
        <Bar dataKey="inicial" name="Antes" fill="url(#gradRuimInicial)" radius={[8, 8, 0, 0]} animationDuration={800} />
        <Bar dataKey="atual" name="Agora" fill="url(#gradRuimAtual)" radius={[8, 8, 0, 0]} animationDuration={800} animationBegin={200} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RadarHabitosChart({ data, temAntigos }: { data: RadarData[]; temAntigos: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <defs>
          <linearGradient id="gradRadarAtual" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0.15} />
          </linearGradient>
        </defs>
        <PolarGrid stroke="#e8e3d8" strokeDasharray="3 3" />
        <PolarAngleAxis dataKey="dim" fontSize={11} stroke="#7d7670" tickLine={false} />
        <PolarRadiusAxis angle={90} domain={[0, 10]} fontSize={9} stroke="#ddd" axisLine={false} />
        <Radar name="Atual" dataKey="atual" stroke="#059669" fill="url(#gradRadarAtual)" strokeWidth={2.5} dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }} animationDuration={1000} />
        {temAntigos && (
          <Radar name="Anterior" dataKey="anterior" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.05} strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 3, fill: '#f59e0b', strokeWidth: 1, stroke: '#fff' }} animationDuration={1000} animationBegin={300} />
        )}
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: 8 }} iconType="circle" iconSize={8} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function PesoChart({ data }: { data: PesoData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="gradPesoArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f0e8" vertical={false} />
        <XAxis dataKey="data" fontSize={10} stroke="#9c9588" axisLine={false} tickLine={false} dy={6} />
        <YAxis domain={['dataMin - 1', 'dataMax + 1']} fontSize={10} stroke="#ccc" axisLine={false} tickLine={false} unit=" kg" dx={-4} />
        <Tooltip content={({ active, payload, label }: any) => {
          if (!active || !payload?.length) return null;
          return (
            <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f0ede8' }}>
              <p style={{ fontSize: 11, color: '#7d7670', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed' }}>{payload[0].value} kg</p>
            </div>
          );
        }} />
        <Area type="monotone" dataKey="peso" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gradPesoArea)" dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#7c3aed', stroke: '#fff', strokeWidth: 3 }} animationDuration={1000} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
