import { useId } from 'react';
import type { RoleId } from '../data';
import { PanLogo } from './PanLogo';

const nodes = [
  { id: 'affiliate', x: 108, y: 109 },
  { id: 'provider', x: 250, y: 58 },
  { id: 'merchant', x: 392, y: 109 },
  { id: 'team', x: 346, y: 207 },
  { id: 'regional', x: 154, y: 207 },
] as const;

/** A native vector instrument: the selected partner role lights its own route. */
export function NetworkOrbit({ role }: { role: RoleId }) {
  const id = useId();
  return (
    <div className="network-orbit" aria-hidden="true">
      <svg viewBox="0 0 500 260" fill="none">
        <defs>
          <radialGradient id={`${id}-halo`}>
            <stop stopColor="#ff0077" stopOpacity=".23" />
            <stop offset="1" stopColor="#ff0077" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id={`${id}-rim`}
            x1="205"
            y1="90"
            x2="286"
            y2="178"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#d9deed" stopOpacity=".8" />
            <stop offset=".35" stopColor="#424956" />
            <stop offset=".65" stopColor="#11141e" />
            <stop offset="1" stopColor="#ee74ab" stopOpacity=".6" />
          </linearGradient>
          <radialGradient id={`${id}-glass`} cx=".3" cy=".18" r=".85">
            <stop stopColor="#444855" />
            <stop offset=".5" stopColor="#181b26" />
            <stop offset="1" stopColor="#0b0d15" />
          </radialGradient>
        </defs>
        <ellipse cx="250" cy="145" rx="162" ry="103" fill={`url(#${id}-halo)`} />
        <g className="orbit-rings">
          <ellipse cx="250" cy="143" rx="169" ry="78" />
          <ellipse cx="250" cy="143" rx="143" ry="65" />
          <ellipse cx="250" cy="143" rx="118" ry="53" />
          <path d="M250 33v26m0 150v31M65 143h27m316 0h27" />
          <ellipse className="orbit-calibration" cx="250" cy="143" rx="180" ry="86" />
        </g>
        {nodes.map((node, index) => (
          <g className={`orbit-route ${role === node.id ? 'is-selected' : ''}`} key={node.id}>
            <path className="orbit-wire" d={`M250 135 Q${node.x} 145 ${node.x} ${node.y}`} />
            <circle className="orbit-node-aura" cx={node.x} cy={node.y} r="15" />
            <circle className="orbit-node-rim" cx={node.x} cy={node.y} r="7" />
            <circle className="orbit-node" cx={node.x} cy={node.y} r="2.6" />
            <text x={node.x} y={node.y + (index === 1 ? -17 : 24)} textAnchor="middle">
              0{index + 1}
            </text>
          </g>
        ))}
        <ellipse cx="250" cy="179" rx="45" ry="8" fill="#000" opacity=".4" />
        <path
          d="m250 85 42 24v48l-42 24-42-24v-48Z"
          fill={`url(#${id}-glass)`}
          stroke={`url(#${id}-rim)`}
        />
        <path d="m211 110 39 23 39-23m-39 23v44" stroke="#b9c5de" strokeOpacity=".13" />
        <circle cx="250" cy="129" r="32" fill={`url(#${id}-glass)`} stroke={`url(#${id}-rim)`} />
        <path
          d="M227 109a30 30 0 0 1 40-2"
          stroke="#e3e9f8"
          strokeOpacity=".35"
          strokeLinecap="round"
        />
        <PanLogo x="232" y="106" width="36" height="44" />
        <path
          className="orbit-core-light"
          d="m222 157 28 16 28-16"
          stroke="#ff3c98"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
