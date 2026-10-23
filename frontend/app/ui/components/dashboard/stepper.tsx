"use client"
import React from 'react';
import WifiFindIcon from '@mui/icons-material/WifiFindRounded';
import SecurityIcon from '@mui/icons-material/SecurityRounded';
import LockOpenIcon from '@mui/icons-material/LockOpenRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

interface StepperProps {
  isActivated: number;
}

const steps = [
  { label: 'Scan networks', icon: WifiFindIcon },
  { label: 'Attack target', icon: SecurityIcon },
  { label: 'Crack handshake', icon: LockOpenIcon },
];

const StepperComponent: React.FC<StepperProps> = ({ isActivated }) => {
  return (
    <div className="panel px-6 py-5">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const done = index < isActivated;
          const current = index === isActivated;
          const Icon = step.icon;
          return (
            <React.Fragment key={step.label}>
              <li className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                    done
                      ? 'border-success bg-success/15 text-success'
                      : current
                      ? 'border-brand bg-brand/15 text-brand'
                      : 'border-[color:var(--border)] bg-surface-hi text-[color:var(--text-dim)]'
                  }`}
                >
                  {done ? <CheckRoundedIcon /> : <Icon />}
                </div>
                <span
                  className={`text-xs font-medium ${
                    done || current ? 'text-white' : 'text-[color:var(--text-dim)]'
                  }`}
                >
                  {step.label}
                </span>
              </li>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 mb-6 h-0.5 flex-1 rounded transition ${
                    index < isActivated ? 'bg-success' : 'bg-[color:var(--border)]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </div>
  );
};

export default StepperComponent;
