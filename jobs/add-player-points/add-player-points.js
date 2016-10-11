'use strict';

const comunio = require('comunio');
const seneca = require('seneca')();
const dbApi = seneca.client({port: 10102, timeout: 100000});
const statsUrl = 'http://stats.comunio.de/profile/';
const cheerio = require('cheerio');
const rp = require('request-promise');
const { seasonStart } = require('./config.json');

//1. get all comunio player ids and also save db id
dbApi.act('role:database,players:get', (err, players) => {
    if(err) throw err;

    dbApi.act('role:database,clubs:get', (err, clubs) => {
        if(err) throw err;

        const clubMap = clubs
            .map(club => ({ id: club.id, comclubid: club.comclubid }))
            .reduce((previous, next) => {
                return Object.assign({}, previous, { [String(next.comclubid)]: next.id});
            }, {});

        //reduce each player information to only complayerid and id
        Promise.all(players
            //2. get html via request
            .map(player => {
                return rp(encodeURI(statsUrl + (seasonStart + 1) + '/' + player.complayerid + '-' + player.name))
                    .then(html => {
                        return getPlayerStatsFromHtml(html).map(gameStat => Object.assign({}, gameStat, {playerId: player.id}));
                    });
            }))
            .then(gameStats => {
                const stats = gameStats
                    .reduce((previous, next) => previous.concat(next))
                    .map(gameStat => ({
                        playerId: gameStat.playerId,
                        gameDay: gameStat.gameDay,
                        seasonStart: seasonStart,
                        goals: gameStat.goals,
                        home: gameStat.home,
                        opponentId: clubMap[gameStat.opponent],
                        cards: gameStat.cards,
                        subIn: gameStat.subIn,
                        subOut: gameStat.subOut,
                        points: gameStat.points
                    }));
                dbApi.act({
                    role: 'database',
                    playerStats: 'addAll',
                    data: stats
                }, (err, res) => {
                    if(err) console.error(err);
                });
                    /*.forEach(gameStat => {
                        //4. save it in db
                        //{gameDay, goals, cards, subIn, subOut, points, opponent, home, homeScore, awayScore}

                        dbApi.act({
                            role: 'database',
                            playerStats: 'add',
                            data: {
                                playerId: gameStat.playerId,
                                gameDay: gameStat.gameDay,
                                seasonStart: seasonStart,
                                goals: gameStat.goals,
                                home: gameStat.home,
                                opponentId: clubMap[gameStat.opponent],
                                cards: gameStat.cards,
                                subIn: gameStat.subIn,
                                subOut: gameStat.subOut,
                                points: gameStat.points
                            }
                        }, (err, res) => {
                           if(err) console.error(err);
                        });
                    })*/
            }).catch(err => console.error(err));
    });
});

//3. get points, goals, cards, substitution-in, substitution-out, opponent, home, score-home, score-away for each game day
function getPlayerStatsFromHtml(html) {
    const playerStats = [];
    const $ = cheerio.load(html);
    const cardTranslation = {
        "Rot": "red",
        "Gelb": "yellow",
        "Gelb-Rot" : "yellow-red"
    };
    $('div.tablebox').last().find('table tr').slice(1).each(function(idx, element) {
        const gameStats = $(this).children();
        const gameDay = Number(gameStats.eq(0).text());
        //if gameStats.eq(1).text() == "" then it will be evaluated to 0
        const goals = Number(gameStats.eq(1).text());
        const cards = gameStats.eq(2).find('img').length == 0 ? undefined : !!cardTranslation[gameStats.eq(2).find('img').attr('alt')] ? cardTranslation[gameStats.eq(2).find('img').attr('alt')] : gameStats.eq(2).find('img').attr('alt');
        const subIn = Number(gameStats.eq(3).text()) == 0 ? undefined : Number(gameStats.eq(3).text());
        const subOut = Number(gameStats.eq(4).text()) == 0 ? undefined : Number(gameStats.eq(4).text());
        const points = gameStats.eq(5).text() == "-" ? undefined : Number(gameStats.eq(5).text());
        const opponent = Number(gameStats.eq(6).children().attr('href').replace('/squad/','').replace(/-.+/g, ''));
        const home = gameStats.eq(7).text() == "h" ? true : gameStats.eq(7).text() == "a" ? false : undefined;
        const result = gameStats.eq(8).text().split(':');
        const homeScore = Number(result[0]);
        const awayScore = Number(result[1]);
        playerStats.push({gameDay, goals, cards, subIn, subOut, points, opponent, home, homeScore, awayScore});
    });
    return playerStats;
}