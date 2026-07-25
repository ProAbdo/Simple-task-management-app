import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { loginUser } from '@/features/auth/auth.api';
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/auth.schemas';
import { useAuth } from '@/features/auth/auth.context';
import { PasswordField } from '@/features/auth/components/password-field';

export function LoginPage() {
  const navigate = useNavigate();
  const { startSession } = useAuth();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (session) => {
      startSession(session);
      navigate('/app', { replace: true });
    },
  });

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  return (
    <div className="animate-auth-enter">
      <div>
        <span className="mb-4 inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-extrabold tracking-[0.1em] text-indigo-700 uppercase">
          Welcome back
        </span>
        <h2 className="text-4xl font-extrabold tracking-[-0.045em] text-slate-950 sm:text-[2.75rem]">
          Pick up where you left off.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-500">
          Sign in to open your private workspace and keep the momentum going.
        </p>
      </div>

      <form className="mt-9 space-y-5" noValidate onSubmit={onSubmit}>
        {loginMutation.isError ? (
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
                loginMutation.error,
                'We could not sign you in. Please try again.',
              )}
            </span>
          </div>
        ) : null}

        <InputField
          autoComplete="email"
          disabled={loginMutation.isPending}
          error={errors.email?.message}
          icon={<Mail aria-hidden="true" size={18} />}
          id="login-email"
          label="Email address"
          placeholder="you@example.com"
          type="email"
          {...register('email')}
        />

        <PasswordField
          autoComplete="current-password"
          disabled={loginMutation.isPending}
          error={errors.password?.message}
          icon={<LockKeyhole aria-hidden="true" size={18} />}
          id="login-password"
          label="Password"
          placeholder="Enter your password"
          {...register('password')}
        />

        <Button
          className="mt-2 w-full"
          isLoading={loginMutation.isPending}
          loadingLabel="Signing you in"
          type="submit"
        >
          Sign in
          <ArrowRight aria-hidden="true" size={18} />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        New to Taskflow?{' '}
        <Link
          className="font-bold text-indigo-600 underline decoration-indigo-200 underline-offset-4 transition hover:text-indigo-800 hover:decoration-indigo-400 focus-visible:rounded focus-visible:ring-4 focus-visible:ring-indigo-500/15 focus-visible:outline-none"
          to="/register"
        >
          Create your account
        </Link>
      </p>
    </div>
  );
}
