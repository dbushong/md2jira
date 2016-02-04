# turn off all the builtin C-specific crap
.SUFFIXES:
MAKEFLAGS += --no-builtin-rules

md2jira.zip: manifest.json scripts/* images/*
	@zip -r $@ $^
