import React, { useState } from "react";
import { Stepper, Step, StepLabel } from "@mui/material";
import WifiFindIcon from '@mui/icons-material/WifiFind';
import AttackIcon from '@mui/icons-material/Security';
import LockOpenIcon from '@mui/icons-material/LockOpen';

interface StepperProps {
  isActivated: number;
}

const StepperComponent: React.FC<StepperProps> = ({ isActivated }) => {
  const steps = [
    { label: "Scanning Wireless Networks", icon: <WifiFindIcon />, color: "" },
    { label: "Attacked", icon: <AttackIcon />, color: "" },
    { label: "Cracked", icon: <LockOpenIcon />, color: "" },
  ];

  return (
    <div className="bg-neutral-900 p-6 rounded-full shadow-lg h-half-screen mt-6 ml-8 mr-8">
      <Stepper alternativeLabel>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel
              StepIconComponent={() => (
                <div className={index < isActivated ? "text-green-500" : "text-white"}>
                  {step.icon}
                </div>
              )}
            >
              <div className={index < isActivated ? "text-green-500" : "text-white"}>
                {step.label}
              </div>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

export default StepperComponent;
