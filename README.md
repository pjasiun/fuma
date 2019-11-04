# Fuma - Fussball Manager for Slack

[![Build Status](https://travis-ci.org/pjasiun/fuma.svg?branch=master)](https://travis-ci.org/pjasiun/fuma)
[![codecov](https://codecov.io/gh/pjasiun/fuma/branch/master/graph/badge.svg)](https://codecov.io/gh/pjasiun/fuma)

Fuma is a Slack bot for managing table soccer games. Fuma helps you implement [Elo rating system](https://en.wikipedia.org/wiki/Elo_rating_system) in managing and recording your local fussball games.

<img align="center" src="https://raw.githubusercontent.com/pjasiun/fuma/master/images/slack.png">

## How to install?

What do you need?
 - access to Slack custom integrations in your organization,
 - a server that supports Node.js (tested on v6.17.1), only port 80 need to be open,

1. Create a new [slash command](https://api.slack.com/interactivity/slash-commands) for Slack:
  - command, Customize Name, Customize Icon - use any you want,
  - URL - use the URL where the Fuma will be available,
  - method - POST,
  - Autocomplete help text:
    - "Show this command in the autocomplete list" - turn on, 
    - Usage hint - "help"
  - Token - will be needed later on the backend integration.

2. Clone this repository.
3. Copy `config.json.tmp` as `config.json` and edit it:
  - token - same as in your slash command for slack integration,
  - host and port - same as in URL used for your slack integration.

4. Upload the project on the Node.js server. 
5. Run `app.js`.
6. Set permissions:

```
chmod 777 data
chmod +x app.js
```

7. Check if everything works fine:

Try using `/commandName help` in your Slack to check if everything works correctly.

It is also recommended to add some aliased and matches to data and restart the server to make sure that persistence store works fine and you will not loose your data when the server restarts.

## Feature

We will use `fb` as the command name and `fuma.example.com` as the domain name for further samples.

### Help

To see help page use:

```
/fb help
```

### Joining to the match

To join yourself to the next match, use:

```
/fb +
```

Joining to the match is anonymous, so as long as there are no 4 players you will not know who joined.

You can also add another Slack user:

```
/fb + @a
```

Or multiple users using:

```
/fb + @a @b
```

If you want to remove yourself, use:

```
/fb -
```

If at the end of the day some users are still added, but there are less then 4 players they are removed automatically at the beginning of the next day.

When 4 players are added Fuma will show you a proposal of teams, sides and the expected result based on the users' current rank.

### Expected result

The expected result means that players on the side which gets more points than expected, get points after the match. Thanks to the Elo rank system, one does not need to win the match to get points. He/She needs to make progress comparing to his/her opponents.

To get the expected result without adding players use:

```
/fb expected @a @b : @c @d
```

### Adding results of the match

To add the match result to the rank of matches, use:

```
/fb @a @b 10 : 7 @c @d
```

Note, that adding results is not connected with joining matches. You do not need to use `/fb +` to play nor adding to rank will not reset added players.

To updates match result:

```
/fb update @a @b 10 : 7 @c @d -> @a @b 10 : 8 @c @d
```

To removes match result:

```
/fb remove @a @b 10 : 7 @c @d
```

Last found match result will be updated or removed.

### Rank

Use this command to see the current rank:

```
/fb rank
```

Note that the rank skips rookies and oldboys.

Rookies are players who have not played 20 matches yet. Since each user gets the same number of points at the beginning until you play 20 matches, your rank position may not correspond to your real level

Oldboys are people who have not play for 30 days. Note that these users are only hidden so as soon as they play a game they will be added back to the rank.

If you want to see rookies, oldboys or all users use:

```
/fb rank rookies
/fb rank oldboys
/fb rank all
```

### Statistics

To see rich statistics open: `http://fuma.example.com/stats` on your browser.

<img align="center" src="https://raw.githubusercontent.com/pjasiun/fuma/master/images/rank.png">

### Aliases

Fuma supports users' aliases. For instance, you can do:

```
/fb set alias A @a
/fb set alias HUMILIATED 10 : 0
```

and then you can do:

```
/fb A @b HUMILIATED @c @d
```

instead of:

```
/fb @a @b 10: 0 @c @d
```

Aliases can be used with any command.

All aliases need to be all upper case, with no spaces.

To get the list of all defined aliases, use:

```
/fb aliases
```

To remove alias, use:

```
/fb delete alias A
```

### History

To display the history of last matches, use:

```
/fb history
```

### Public keyword

By default, all commands show the result only for you. If you want to show the result of the commands to all users on the channel, use the `public` keyword, for instance:

```
/fb public history
/fb public rank
/fb public expected @a @b : @c @d
```
