import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

interface Step {
  targetId: string;
  title: string;
  content: string;
  position: 'right' | 'bottom' | 'center';
}

const steps: Step[] = [
  {
    targetId: 'welcome-step',
    title: 'Welcome to EventPass',
    content: "Let's take a quick tour to help you get started with your event management system.",
    position: 'center'
  },
  {
    targetId: 'dashboard',
    title: 'Dashboard Overview',
    content: 'View your real-time sales, revenue, and event performance statistics here.',
    position: 'right'
  },
  {
    targetId: 'create-event',
    title: 'Create Events',
    content: 'Start here! Set up new events, define pricing, currencies, and locations.',
    position: 'right'
  },
  {
    targetId: 'generate-ticket',
    title: 'Issue Tickets',
    content: 'Manually generate and download printable tickets with QR codes for your attendees.',
    position: 'right'
  },
  {
    targetId: 'scanner',
    title: 'Verification Scanner',
    content: 'Use this tool to scan ticket IDs or QR codes at the event entrance for validation.',
    position: 'right'
  }
];

export const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('eventpass_intro_shown');
    if (!hasSeenTour) {
      setTimeout(() => setIsActive(true), 800);
    }
    
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateRect = useCallback(() => {
    if (!isActive) return;
    const step = steps[currentStep];
    
    if (step.position === 'center') {
      setTargetRect(null);
      return;
    }

    let el = document.getElementById(`nav-item-${step.targetId}`);
    
    // Check for mobile nav item if desktop not visible
    if (!el || el.offsetParent === null) {
      el = document.getElementById(`mobile-nav-item-${step.targetId}`);
    }

    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isActive]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [updateRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const finishTour = () => {
    localStorage.setItem('eventpass_intro_shown', 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  const step = steps[currentStep];
  const isCenter = step.position === 'center' || !targetRect;
  const isMobile = windowWidth < 768;

  // Calculate Popover Position
  let popoverStyle: React.CSSProperties = {};
  
  if (isCenter) {
    popoverStyle = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      position: 'fixed',
      zIndex: 110, // Higher than backdrop
      width: 'calc(100% - 32px)',
      maxWidth: '24rem',
    };
  } else if (targetRect) {
    if (isMobile) {
        // Mobile positioning: Always center horizontally, place below target
        popoverStyle = {
            top: targetRect.bottom + 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)', // Full width minus padding
            maxWidth: '380px',
            position: 'fixed',
            zIndex: 110
        };

        // If target is too low, place above? (Simpler to just ensure bottom margin in UI, but sticky header is top)
        // Mobile header is at top, so bottom + 16 is fine.
    } else {
        // Desktop positioning: To the right of the sidebar
        popoverStyle = {
            top: Math.max(16, targetRect.top),
            left: targetRect.right + 20,
            width: '24rem',
            position: 'fixed',
            zIndex: 110
        };
    }
  }

  return (
    <>
      {/* Spotlight Backdrop */}
      <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
         {targetRect ? (
             <div 
               className="absolute transition-all duration-300 ease-in-out border-slate-900/70"
               style={{
                 top: targetRect.top,
                 left: targetRect.left,
                 width: targetRect.width,
                 height: targetRect.height,
                 boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75)',
                 borderRadius: '8px',
               }}
             />
         ) : (
             <div className="absolute inset-0 bg-slate-900/75" />
         )}
      </div>

      {/* Popover Card */}
      <div 
        className="bg-white p-6 rounded-xl shadow-2xl transition-all duration-300 border border-slate-100"
        style={popoverStyle}
      >
        <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
            <button onClick={finishTour} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
            </button>
        </div>
        
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            {step.content}
        </p>

        <div className="flex justify-between items-center">
            <div className="flex gap-1.5">
                {steps.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200'}`}
                    />
                ))}
            </div>
            
            <div className="flex gap-3">
                {currentStep > 0 && (
                    <button 
                        onClick={handlePrev}
                        className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        Back
                    </button>
                )}
                <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                    {currentStep === steps.length - 1 ? <Check size={16} /> : <ChevronRight size={16} />}
                </button>
            </div>
        </div>
      </div>
    </>
  );
};