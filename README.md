# Fuma - Fussball Manager for Slack

[![Build Status](https://travis-ci.org/jodator/fuma.svg?branch=master)](https://travis-ci.org/jodator/fuma)
[![codecov](https://codecov.io/gh/jodator/fuma/branch/master/graph/badge.svg)](https://codecov.io/gh/jodator/fuma)

A Slack bot for managing table soccer games.

## What it does

Fuma helps you implement [Elo rating system](https://en.wikipedia.org/wiki/Elo_rating_system) in managing and recording your local _fußball_ games.

## Commands

**/fb help** help page

**/fb @a @b 10 : 7 @c @d** enter match result

**/fb history** matches history

**/fb update @a @b 10 : 7 @c @d -> @a @b 10 : 8 @c @d** updates last found match result

**/fb remove @a @b 10 : 7 @c @d** removes last found match result

**/fb public history** print the history on the channel, may be used with every command
