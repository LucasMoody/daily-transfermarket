const comunio = require('../comunio.js');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiThings = require('chai-things');
chai.use(chaiThings);
chai.use(chaiAsPromised);
const expect = chai.expect;
const should = chai.should();
const Q = require('q');

describe('#getCommunityByUser(username)', function() {
    this.timeout(10000);
    it('should return comunio id 1228147 and comunio name "Gladiolen oder Tod"', function() {
        return comunio.getCommunityByUser('Luque88').should.eventually.eql({id : 1228147, name : 'Gladiolen oder Tod'});
    });
    it('should return comunio id 1605015 and comunio name "Das Spiel des Lebens"', function() {
        return comunio.getCommunityByUser('LucasMoody').should.eventually.eql({id : 1605015, name : 'Das Spiel des Lebens'});
    });
    it('should throw an error with a message saying that the user does not exist', function() {
        const user = 'aaaaaaaaaaaaaaaaaaaaaaaa';
        return comunio.getUserId('aaaaaaaaaaaaaaaaaaaaaaaa').should.be.rejectedWith(new RegExp(user + " does not exist"));
    });
});

describe('#getUserId(username)', function() {
    this.timeout(10000);
    it('should return user id 9426390', function() {
        return comunio.getUserId('Luque88').should.eventually.equal(9426390);
    });
    it('should return user id 10159673', function() {
        return comunio.getUserId('LucasMoody').should.eventually.equal(10159673);
    });
    it('should throw an error with a message saying that the user does not exist', function() {
        const user = 'aaaaaaaaaaaaaaaaaaaaaaaa';
        return comunio.getUserId('aaaaaaaaaaaaaaaaaaaaaaaa').should.be.rejectedWith(new RegExp(user + " does not exist"));
    });
});

describe('#getMarketValueForPlayerAtDate(playerId, date)', function() {
    this.timeout(10000);
    it('should return 13640000 for player with id 32192 (who is Aubameyang) at the date 2015-12-23', function() {
       return comunio.getMarketValueForPlayerAtDate('32192', '2015-12-23').should.eventually.eql({quote: 13640000, date: '2015-12-23'});
    });
    it('should return 9190000 for player with id 31552 (who is Robben) at the date 2015-12-23', function() {
        return comunio.getMarketValueForPlayerAtDate('31552', '2015-12-23').should.eventually.eql({quote: 9190000, date: '2015-12-23'});
    });
    it('should be rejected because the date format is not yyyy-mm-dd', function() {
        return comunio.getMarketValueForPlayerAtDate('32192', '23.12.2015').should.be.rejectedWith('incorrect date format. use yyyy-mm-dd');
    });
});

describe('#getPlayersByClubId(clubId)', function() {
    this.timeout(20000);
    it('should return an array which length is greater than 0 for club id 1 (which is FC Bayern Muenchen', function() {
        return comunio.getPlayersByClubId('1').should.eventually.have.length.above(0);
    });
    it('should return an array of players where all elements have the properties ', function() {
        return comunio.getPlayersByClubId('1').should.eventually.all.contain.keys('id', 'clubid', 'position', 'name', 'points', 'quote', 'status', 'rankedgamesnumber');
    });
    it('should return an array which length is greater than 0 for club id 12 (which is VFL Wolfsburg', function() {
        return comunio.getPlayersByClubId('12').should.eventually.have.length.above(0);
    });
    it('should return an array of players where all elements have the properties id, clubid, position, name, points, quote, status, rankedgamesnumber', function() {
        return comunio.getPlayersByClubId('12').should.eventually.all.contain.keys('id', 'clubid', 'position', 'name', 'points', 'quote', 'status', 'rankedgamesnumber');
    });
});

describe('#getCommunityMarket(communityId)', function() {
    this.timeout(20000);
    it('should return an array which length is greater than 0 for comunio id 1228147', function() {
       return comunio.getCommunityMarket('1228147').should.eventually.have.length.above(0);
    });
    it('should return an array of players where all elements have the properties id, clubid, position, name, points, quote, status, recommendedprice, ownerid, placed', function() {
        return comunio.getCommunityMarket('1228147').should.eventually.all.contain.keys('id', 'clubid', 'position', 'name', 'points', 'quote', 'status', 'recommendedprice', 'ownerid', 'placed');
    });
    it('should return an array which length is greater than 0 for comunio id 1605015', function() {
        return comunio.getCommunityMarket('1605015').should.eventually.have.length.above(0);
    });
    it('should return an array of players where all elements have the properties id, clubid, position, name, points, quote, status, recommendedprice, ownerid, placed', function() {
        return comunio.getCommunityMarket('1605015').should.eventually.all.contain.keys('id', 'clubid', 'position', 'name', 'points', 'quote', 'status', 'recommendedprice', 'ownerid', 'placed');
    });
});

describe('#getCommunityName(communityId)', function() {
    it('should return "Das Spiel des Lebens" for comunio id 1605015', function() {
      return comunio.getCommunityName('1605015').should.eventually.equal("Das Spiel des Lebens");
    });
    it('should return "Gladiolen oder Tod" for comunio id 1228147', function() {
        return comunio.getCommunityName('1228147').should.eventually.equal("Gladiolen oder Tod");
    });
    it('should throw an Error for aaaaa', function() {
        return comunio.getCommunityName('aaaaa').should.eventually.be.rejectedWith(Error);
    });
    it('should throw an Error for 999999999999', function() {
        return comunio.getCommunityName('999999999999').should.eventually.be.rejectedWith(Error);
    });
});

describe('#getMarketValueForPlayer(playerId, numDays)', function() {
    this.timeout(20000);
    it('should return an array which length is 90', function() {
       return comunio.getMarketValueForPlayer('32192', 90).should.eventually.have.length(90);
    });
    it('should return an array of market values where all elements have the properties id, clubid, position, name, points', function() {
        return comunio.getMarketValueForPlayer('32192', 5).should.eventually.all.have.keys('date','quote');
    });
});