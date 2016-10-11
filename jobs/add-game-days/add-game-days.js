const rp = require('request-promise');

const config = require('./config.json');
const { scheduleUrl, seasonStart } = config;
var seneca = require('seneca')();
const externalClubMapping = require('./external-club-mapping.json');
const dbApi = seneca.client(10102);

rp(scheduleUrl)
    .then(rawSchedule => {
        return JSON.parse(rawSchedule).begegnungen.map(match => {
            return {
                gameDay: match.spieltag,
                homeScore: match.heimTeamTore,
                guestScore: match.auswaertsTeamTore,
                homeClubId: externalClubMapping[match.heimTeamNameLang] ? externalClubMapping[match.heimTeamNameLang]: match.heimTeamNameLang,
                guestClubId: externalClubMapping[match.auswaertsTeamNameLang] ? externalClubMapping[match.auswaertsTeamNameLang]: match.auswaertsTeamNameLang,
                seasonStart: seasonStart
            }
        });
    })
    .then(schedule => {
        schedule.forEach(scheduledGame => dbApi.act({
            role: 'database',
            game: 'add',
            data: scheduledGame
        }, (err, res) => {
            if(err) console.error(err);
        }));
    })
    .catch(err => console.error(err));

