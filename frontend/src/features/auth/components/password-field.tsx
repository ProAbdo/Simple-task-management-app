import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';

import { InputField, type InputFieldProps } from '@/components/ui/input-field';

type PasswordFieldProps = Omit<InputFieldProps, 'trailing' | 'type'>;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(props, ref) {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <InputField
        {...props}
        ref={ref}
        type={isVisible ? 'text' : 'password'}
        trailing={
          <button
            aria-label={isVisible ? 'Hide password' : 'Show password'}
            className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:outline-none"
            onClick={() => setIsVisible((visible) => !visible)}
            type="button"
          >
            {isVisible ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </button>
        }
      />
    );
  },
);
