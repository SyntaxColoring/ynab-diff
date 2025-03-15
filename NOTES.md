# Bugs

1. Have a mismatch like 10 vs. 15, where there are nonzero correct matches.
2. Exclude 5 good transactions in the process of comparing and resolving incrementally.
3. As soon as you exclude the 5th one, the filter will automatically close and you'll have no way of reopening it.

Non-cleared transactions should be excluded by default
Reconciled transactions should be excluded or not depending on how far back the bank import goes

# Features

Hide comparison until outflow column is selected. Highlight the controls that the user needs to use to move on.

Table features
Sorting
Multi select

Filter by amount even when there is no mismatch of that amount? (see bug above

Better currency dropdown - include currency name

localstorage for settings

Undo/redo

Import from API

# Import instructions

Include a buffer of some transactions that you've already reconciled.
It's easier to ignore extra YNAB transactions than to ignore extra bank transactions?
