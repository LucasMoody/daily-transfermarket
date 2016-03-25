const rp = require('request-promise');

const config = require('config.json');
const scheduleUrl = config.scheduleUrl;
const externalClubMapping = require('external-club-mapping.json');

rp(scheduleUrl)
    .then(rawSchedule => {
        return rawSchedule.begegnungen.map(match => {
            return {
                gameDay: match.spieltag,
                homeScore: match.heimTeamTore,
                awayScore: match.auswaertsTeamTore,
                homeTeam: externalClubMapping[match.heimTeamNameLang],
                guestTeam: externalClubMapping[match.auswaertsTeamNameLang]
            }
        });
    })
    .then(schedule => {
        //save to db
    })
    .catch(err => console.error(err));

