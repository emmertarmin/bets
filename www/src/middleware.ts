import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware((context, next) => {
  if (
    !/\/login\/?$/.test(context.url.pathname)
    && !/\/register\/?$/.test(context.url.pathname)
    && !context.cookies.has('pbToken')
  ) {
    return context.redirect('/login', 303)
  }
  return next()
});