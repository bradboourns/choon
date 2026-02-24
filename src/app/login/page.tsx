import { loginAction } from '../actions';

export default function LoginPage() {
  return <form action={loginAction} className='mx-auto flex max-w-sm flex-col gap-3 rounded-xl border border-zinc-700 p-4'>
    <h1 className='text-2xl font-bold'>Log in</h1>
    <input name='email' type='email' required placeholder='Email' className='rounded bg-zinc-900 p-2'/>
    <input name='password' type='password' required placeholder='Password' className='rounded bg-zinc-900 p-2'/>
    <button className='rounded bg-violet-600 p-2'>Log in</button>
  </form>;
}
