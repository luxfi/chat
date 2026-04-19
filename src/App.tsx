import { Route, Switch, Link } from 'wouter'
import { Header } from './components/Header'
import { ChatPage } from './pages/ChatPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'

export function App() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/" component={ChatPage} />
        <Route path="/search/:id" component={ChatPage} />
        <Route path="/iframe" component={ChatPage} />
        <Route path="/auth/callback" component={AuthCallbackPage} />
        <Route>
          <main className="mx-auto max-w-3xl px-6 pt-24 text-center">
            <h1 className="text-5xl font-medium">404</h1>
            <p className="mt-4 text-[var(--muted)]">
              Page not found. <Link href="/" className="underline">Return home</Link>.
            </p>
          </main>
        </Route>
      </Switch>
    </>
  )
}
