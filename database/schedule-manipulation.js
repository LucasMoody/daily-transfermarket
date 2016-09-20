const rawSchedule = require('./schedule-2015.json');
const clubMap = require('./club-schedule-club-map.json');

const seasonStart = parseInt(rawSchedule.saison.split('-')[0]);
const games = rawSchedule.begegnungen.map(match => {
    return {
        gameDay: match.spieltag,
        seasonStart: seasonStart,
        homeScore: match.heimTeamTore,
        guestScore: match.auswaertsTeamTore,
        homeTeam: clubMap[match.heimTeamNameLang],
        guestTeam: clubMap[match.auswaertsTeamNameLang]
    }
}).filter(game => game.gameDay <= 3);

console.log(games);