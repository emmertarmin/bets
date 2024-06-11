import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware((context, next) => {
  if (
    !context.url.pathname.endsWith('/login')
    && !context.url.pathname.endsWith('/register')
    && !context.cookies.has('pbToken')
  ) {
    return context.redirect('/login', 303)
  }
  return next()
});