import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { registerUser } from '@/features/auth/auth.api';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/auth.schemas';
import { useAuth } from '@/features/auth/auth.context';
import { PasswordField } from '@/features/auth/components/password-field';

export function RegisterPage() {
  const navigate = useNavigate();
  const { startSession } = useAuth();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (session) => {
      startSession(session);
      navigate('/app', { replace: true });
    },
  });

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate(values);
  });

  return (
    <div className="animate-auth-enter">
      <div>
        <span className="mb-4 inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-extrabold tracking-[0.1em] text-indigo-700 uppercase">
          Start fresh
        </span>
        <h2 className="text-4xl font-extrabold tracking-[-0.045em] text-slate-950 sm:text-[2.75rem]">
          Make space for your best work.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-500">
          Create your account and turn every next step into visible progress.
        </p>
      </div>

      <form className="mt-8 space-y-4.5" noValidate onSubmit={onSubmit}>
        {registerMutation.isError ? (
          <div
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700"
            role="alert"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={18}
            />
            <span>
              {getApiErrorMessage(
                registerMutation.error,
                'We could not create your account. Please try again.',
              )}
            </span>
          </div>
        ) : null}

        <InputField
          autoComplete="name"
          disabled={registerMutation.isPending}
          error={errors.name?.message}
          icon={<UserRound aria-hidden="true" size={18} />}
          id="register-name"
          label="Full name"
          placeholder="Your name"
          type="text"
          {...register('name')}
        />

        <InputField
          autoComplete="email"
          disabled={registerMutation.isPending}
          error={errors.email?.message}
          icon={<Mail aria-hidden="true" size={18} />}
          id="register-email"
          label="Email address"
          placeholder="you@example.com"
          type="email"
          {...register('email')}
        />

        <div>
          <PasswordField
            autoComplete="new-password"
            disabled={registerMutation.isPending}
            error={errors.password?.message}
            icon={<LockKeyhole aria-hidden="true" size={18} />}
            id="register-password"
            label="Password"
            placeholder="At least 8 characters"
            {...register('password')}
          />
          {!errors.password ? (
            <p className="mt-1.5 text-xs leading-5 text-slate-400">
              Use 8 or more characters to keep your account secure.
            </p>
          ) : null}
        </div>

        <Button
          className="mt-2 w-full"
          isLoading={registerMutation.isPending}
          loadingLabel="Creating your account"
          type="submit"
        >
          Create account
          <ArrowRight aria-hidden="true" size={18} />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          className="font-bold text-indigo-600 underline decoration-indigo-200 underline-offset-4 transition hover:text-indigo-800 hover:decoration-indigo-400 focus-visible:rounded focus-visible:ring-4 focus-visible:ring-indigo-500/15 focus-visible:outline-none"
          to="/login"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
