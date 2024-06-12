export function getFlag(countryCode: string) {
  const flagMap = new Map([
    ['alb', "🇦🇱"],
    ['aut', "🇦🇹"],
    ['bel', "🇧🇪"],
    ['cro', "🇭🇷"],
    ['cze', "🇨🇿"],
    ['den', "🇩🇰"],
    ['eng', "🏴󠁧󠁢󠁥󠁮󠁧󠁿"],
    ['fra', "🇫🇷"],
    ['geo', "🇬🇪"],
    ['ger', "🇩🇪"],
    ['hun', "🇭🇺"],
    ['ita', "🇮🇹"],
    ['ned', "🇳🇱"],
    ['pol', "🇵🇱"],
    ['por', "🇵🇹"],
    ['rou', "🇷🇴"],
    ['sco', "🏴󠁧󠁢󠁳󠁣󠁴󠁿"],
    ['srb', "🇷🇸"],
    ['svn', "🇸🇮"],
    ['svk', "🇸🇰"],
    ['esp', "🇪🇸"],
    ['sui', "🇨🇭"],
    ['tur', "🇹🇷"],
    ['ukr', "🇺🇦"]
  ])
  return flagMap.get(countryCode.toLowerCase())
}