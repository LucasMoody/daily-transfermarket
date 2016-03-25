const rawSchedule = require('schedule-2015.json');

rawSchedule.begegnungen.map(match => {
    return {
        gameDay: match.spieltag,
        homeScore: match.heimTeamTore,
        awayScore: match.auswaertsTeamTore,
        homeTeam: match.heimTeamNameLang,
        guestTeam: match.auswaertsTeamNameLang
    }
});