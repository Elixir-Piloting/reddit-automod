Full AutoModerator documentation
This page is a full specification of AutoModerator's capabilities and behavior, and the syntax for utilizing it. If you are new to AutoModerator and are looking for information about how to set it up and write basic rules, please see the Introduction page and Writing Basic Rules.

General knowledge/behavior
AutoModerator's configuration is kept on a subreddit's wiki, at the "config/automoderator" page.
Rules that may result in an item being removed (action of remove, spam, or filter) are always checked before all other rules.
By default, submissions and comments made by moderators of the subreddit will not be checked against any rules that may cause the post to be removed or reported. You can override this behavior with the moderators_exempt flag.
AutoModerator tries to avoid contradicting other moderators, and will not approve items that have already been removed by another moderator, or remove items that have already been approved by another mod.
AutoModerator will not approve items posted by users that are banned site-wide on reddit unless the approval rule includes a check against author name.
Approval conditions will not re-approve reported items unless the rule includes a reports: check.
Approval actions will only be performed on items that need to be approved to change their state. That is, only items that were automatically removed by reddit's spam-filter, or reported items (as long as the rule includes a reports: check as mentioned above).
AutoModerator will not leave an entry in the moderation log when it sets flair or distinguishes its comments. All other actions (removals, approvals, etc.) will be logged as with any other moderator.
Rules on the body field will always apply to text posts. By default, these rules will not apply to other post types unless some body text is present.
Syntax
AutoModerator rules are defined using YAML, so for full details about allowable syntax you can look up examples or the YAML specification (kind of a difficult/technical document). Some of the most important things to know for AutoModerator specifically:

Rules must be separated by a line starting with exactly 3 hyphens - ---.

Comments can be added by using the # symbol. Generally everything after a # on a line will be treated as a comment and ignored, unless the # is inside a string or otherwise part of actual syntax.

Strings do not generally need to be quoted, but it is usually safest to put either single or double quotes around a string, especially if it includes any special characters at all. For example, the quotes here are unnecessary but encouraged:

title: ["red", "blue", "green"]
If you do not use quotes, there are certain types of strings that the YAML parser will try to automatically convert, which can result in unexpected behavior. In general, these include strings of numbers that start with 0 or 0x, strings that consist of only numbers and underscores, and the words true, false, on, off, yes, no. If in doubt, it is always safest to use quotes.

When defining regular expressions inside a search check, you should always surround the regular expression with quotes, but single quotes are highly encouraged. This avoids needing to double-escape. For example, this check includes the exact same regex twice, but the double-quoted version requires double-escaping all the special characters:

title (regex): ["\\[\\w+\\]", '\[\w+\]']
Note that if you need to include a single quote inside a single-quoted string, the way to do so is by typing two single quotes in a row, not with a backslash. For example: 'it''s done like this'.

Multi-line strings can be defined as well, this is used almost exclusively for defining multi-line comments to post or messages/modmails to send. The syntax for a multi-line string is to have a single pipe character (|) on the first line, and then indent all lines of the multi-line string below and inside. For example:

comment: |
    This is a multi-line comment.

    It has multiple lines.

    You can use **markdown** inside here too.
Lists of items can be defined in two different ways. The most compact method is inside square brackets, comma-separated:

title: ["red", "green", "blue"]
The other method is by indenting the list of items below, with a hyphen at the start of each line. This format is often better for longer or more complex items, or if you want to add a comment on individual items:

title:
    - "red" # like apples
    - "green" # like grapes
    - "blue" # like raspberries
Both formats are exactly the same from AutoModerator's perspective, but one can often be far easier to read than the other.

You should always avoid defining the same thing twice inside a particular rule. This will just end up with the second definition overwriting the first one. For example, a rule like this will end up only affecting youtube submissions and not imgur:

domain: imgur.com
domain: youtube.com
action: remove
Top-level-only checks/actions
The following checks/actions are only available in the top level of a rule, and cannot be included inside sub-groups:

type - defines the type of item this rule should be checked against. Valid values are comment, submission, text submission, link submission, crosspost submission, poll submission, gallery submission or any (default).
priority - must be set to a number. Can be used to define the order that rules should be checked in (though they will still always be checked in two separate groups - rules that might cause any sort of removal first - ones with action of remove, spam or filter, and then all others). Rules with higher priority values will be checked first. If a rule does not have a priority defined, it defaults to zero. Negative priority values can be used as well to specify that certain rules should be checked after ones with no defined priority value.
moderators_exempt - true/false - Defines whether the rule should be skipped when the author of the item is a moderator of the subreddit. Mods are exempt from rules that can result in a removal or report by default, so set this to false to override that behavior, or set it to true to make them exempt from any other rules.
comment - Text of a comment to post in response to an item that satisfies the rule's conditions. Supports placeholders.
comment_locked - true/false - if set to true, the comment automoderator posts in response to an item will be locked from further comment replies.
comment_stickied - true/false - if set to true, the comment automoderator posts in response to an item will be stickied to the top of the submission (will have no effect on non-submissions, as the comment must be top-level)
modmail - Text of a modmail to send to the moderators when an item satisfies the rule's conditions. Supports placeholders.
modmail_subject - If a modmail is sent, the subject of that modmail. Defaults to "AutoModerator notification" if not set. Supports placeholders.
message - Text of a message to send to the author of an item that satisfies the rule's conditions. Supports placeholders.
message_subject - If a message is sent, the subject of that message. Defaults to "AutoModerator notification" if not set. Supports placeholders.
Sub-groups
AutoModerator rules also support "sub-groups" of checks and actions that apply to things that are related to the main item being targeted by the rule. There are currently five supported sub-groups, author, crosspost_author, crosspost_subreddit, subreddit, and parent_submission. parent_submission can be used only if the main item is a comment, but author and crosspost_author can always be used. The author targets the author of the new submission or comment in question, the crosspost_author targets the author of the original submission. If crosspost_author is being used and the base item being checked isn't a crosspost, then the rule will not be applied. crosspost_subreddit targets the subreddit of the original post. subreddit targets the subreddit this rule is being applied within, and is only used for checking the active temporary event label. Checks and actions inside the sub-group should be indented below and inside it. For example, here is a rule that utilizes both sub-groups to set a submission's flair text to "Possible Repost" if a user with the "trusted" flair css class makes a top-level comment inside it including the word "repost":

type: comment
body: "repost"
is_top_level: true
author:
    flair_css_class: "trusted"
parent_submission:
    set_flair: "Possible Repost"
Search Checks
These checks can be used to look for words/phrases/patterns in different fields.

Search checks can be reversed by starting the name with ~. If this is done, the check will only be satisfied if the fields being searched do NOT contain any of the options.
Search checks can be combined by joining them with +. If this is done, the check will be satisfied if ANY of the fields joined together contain one of the options.
Search checks are case-insensitive by default.
Available fields to check against:

For all submissions (base item or parent_submission sub-group):

id - the submission's base-36 ID.
title - the submission's title
domain - the submission's domain. For a text submission, this is "self.subredditname". For gallery submissions, the domain of the optional image outbound urls.
url - the submission's full url. Cannot be checked for text submissions. For gallery submissions, the url of the optional image outbound urls.
body - The full text of the post. It will always be checked for text posts, and checked for other post types only when text is present. For gallery submissions, the optional image captions are included in evaluation.
flair_text - the text of the submission's link flair
flair_css_class - the css class of the submission's link flair
flair_template_id - the template id of the submission's link flair
poll_option_text - The text of each option in a poll post
poll_option_count - The number of options a poll post has.
For crossposts submissions:

The following fields will always be checked against the fields of the original submission.

domain - if the submission is a crosspost, then check the domain of the original submission
url - if the submission is a crosspost, then check the full url of the original submission
body - if the submission is a crosspost, then check the body of the original submission
In addition, we have the following fields that will check the original submission. If the submission isn't a crosspost, then a rule with any of these attributes will be ignored.

crosspost_id - if the submission is a crosspost, then check the base-36 ID of the original submission
crosspost_title - if the submission is a crosspost, then check the title of the original submission
Media checks
On submissions, it is also possible to do some checks against the "media object" that gets embedded in reddit. If the submission is a crosspost, then the values of the original submission are checked. The media data that is available comes from embed.ly, so you can see what information is available for a specific link by testing it here: http://embed.ly/extract

media_author - the author name returned from embed.ly (usually the username of the uploader on the media site)
media_author_url - the author's url returned from embed.ly (usually the link to their user page on the media site)
media_title - the media title returned from embed.ly
media_description - the media description returned from embed.ly
For comments (base item only):

id - the comment's base-36 ID
body - the full text of the comment.
For users (inside author or crosspost_author sub-group):

id - the user's base-36 ID
name - the user's name
flair_text - the text of the user's flair in the subreddit
flair_css_class - the css class of the user's flair in the subreddit
flair_template_id - the template id of the user's flair in the subreddit
For subreddits (inside subreddit or crosspost_subreddit):

name - the name of the subreddit where the original submission was posted
Matching modifiers
These modifiers change how a search check behaves. They can be used to ensure that the field being searched starts with the word/phrase instead of just including it, allow you to define regular expressions, etc.

To specify modifiers for a check, put the modifiers in parentheses after the check's name. For example, a body+title check with the includes and regex modifiers would look like:

body+title (includes, regex): ["whatever", "who cares?"]
Match search methods

These modifiers change how the search options for looked for inside the field, so only one of these can be specified for a particular match. body will always be checked for text posts, and checked for other post types only when text is present.

includes-word - searches for an entire word matching the text
includes - searches for the text, regardless of whether it is included inside other words
starts-with - only checks if the subject starts with the text
ends-with - only checks if the subject ends with the text
full-exact - checks if the entire subject matches the text exactly
full-text - similar to full-exact, except punctuation/spacing on either end of the subject is not considered
Other modifiers

regex - considers the text being searched for to be a regular expression (using standard Python regex syntax), instead of literal text to find
case-sensitive - makes the search case-sensitive, so text with different capitalization than the search value(s) will not be considered a match
If you do not specify a search method modifier for a particular check, it will default to one depending on which field you are checking. Note that if you do any joined search check (multiple fields combined with +), the default is always includes-word. Otherwise, if you are checking a single subject field, the defaults are as follows:

domain: special check that looks only for the exact domain or a subdomain of it
id: full-exact
url: includes
flair_text: full-exact
flair_css_class: full-exact
flair_template_id: full-exact
media_author: full-exact
media_author_url: includes
All other fields default to includes-word.

Non-searching checks
Other checks that can be used that are not search checks (so do not take a value or list of values to look for, cannot be joined with + or reversed with ~, etc.).

For submissions (base item or parent_submission sub-group):

reports - must be set to a number. The minimum number of reports the submission must have to trigger the rule.
body_longer_than - must be set to a number. The submission's body must be longer than this number of characters to trigger the rule (spacing and punctuation characters on either end are not counted). This will always be checked for text posts, and checked for other post types only when text is present.
body_shorter_than - must be set to a number. The submission's body must be shorter than this number of characters to trigger the rule (spacing and punctuation characters on either end are not counted). This will always be checked for text posts, and checked for other post types only when text is present.
is_edited - true/false - if set to true, submissions will only trigger the rule if they have been edited. if set to false, submissions will only trigger the rule if they have NOT been edited (so new submissions will be checked against the rule, but they will not be re-checked on edit).
is_original_content - true/false - if set to true, submissions will only trigger the rule if they are flagged as OC (original content). If set to false, submission will only trigger the rule if the are NOT flagged as OC.
is_poll - true/false - if set to true, submissions will only trigger the rule if they are of the poll submission type.
is_gallery - true/false - if set to true, submissions will only trigger the rule if they are of the gallery submission type.
discussion_type - chat/null - if set to chat, then it will apply to chat posts. if set to null it will apply to comment posts. if this is not specified it will apply to both
is_meta_discussion - true/false - if set to true, submissions will only trigger the rule if they link to a Meta post (invoked by admins).
For comments (base item only):

reports - must be set to a number. The minimum number of reports the comment must have to trigger the rule.
body_longer_than - must be set to a number. The comment's body must be longer than this number of characters to trigger the rule (spacing and punctuation characters on either end are not counted).
body_shorter_than - must be set to a number. The comment's body must be shorter than this number of characters to trigger the rule (spacing and punctuation characters on either end are not counted).
is_top_level - true/false - if set to true, comments will only trigger the rule if they are top-level comments (posted in reply to the submission itself, not to another comment). If set to false, comments will only trigger the rule if they are NOT top-level comments (posted in reply to another comment).
is_edited - if set to true, comments will only trigger the rule if they have been edited. If set to false, comments will only trigger the rule if they have NOT been edited (so new comments will be checked against the rule, but they will not be re-checked on edit).
For subreddits (inside subreddit or crosspost_subreddit):

is_nsfw - true/false - If true, will only match if the subreddit of the original submission is NSFW
event_label - a matching label for the currently active temporary event, if any. This can be used to restrict automoderator rules to only apply if certain temporary events are currently active. See here for more on temporary events.
For users (inside author or crosspost_author sub-group):

Contributor Quality Score (CQS) checks

These checks are often used as a more holistic replacement for karma or account age checks. CQS can help you vet good contributors for specific kinds of content in your community like weekly threads, posts with a specific flair, or general contribution in the subreddit. Every account is assigned one of five CQS scores: highest, high, moderate, low, lowest.

Moderators can use CQSs via the contributor_quality field in automod.

For example, to filter content from authors with a CQS of moderate or higher, the check would be:

author: 
    contributor_quality: "< moderate"
    action: filter 
    action_reason: "CQS Filter"
Karma/age threshold checks

These checks are most often used as "thresholds" - greater than or less than checks. They can be specified using the < or > symbol followed by the value to check if the author has more or less than. For example, to check if the author has less than 10 post karma, the check would be:

author:
    post_karma: < 10
Note that due to the > symbol having a special meaning in YAML syntax, you must put quotes around a greater-than check, but it is not necessary for less-than checks. For example, a check to see if the author has more than 10 post karma would have to be written as:

author:
    post_karma: '> 10'
The supported threshold checks are:

comment_karma - compare to the author's comment karma (note that comment karma will not go below -100)
post_karma - compare to the author's post karma (note that post karma will not go below 0)
combined_karma - compare to the author's combined (comment karma + post karma, combination can not be below -100)

comment_subreddit_karma - compare to the author's comment karma in your community (note that comment karma will not go below -100)

post_subreddit_karma - compare to the author's post karma in your community (note that post karma will not go below 0)

combined_subreddit_karma - compare to the author's combined (comment karma + post karma) karma in your community (comment karma + post karma, combination can not be below -100)

account_age - compare to the age of the author's account. This check also supports specifying a unit (default is days), so you can specify something like account_age: < 60 hours. Supported units are minutes, hours, days, weeks, months, and years.

satisfy_any_threshold - true/false - If true and any karma or age threshold checks are being done, only one of the checks will need to be successful. If false, ALL the checks will need to be satisfied for the rule to trigger (this is the default behavior).

Other user checks

has_verified_email- true/false - if true, will only match if the author has a verified email address or a phone number. If false, will only match if the author does not have neither a verified email address nor a phone number.
is_gold - true/false - If true, will only match if the author has reddit gold. If false, will only match if they do not have gold.
is_submitter - true/false - (only relevant when checking comments) If true, will only match if the author was also the submitter of the post being commented inside. If false, will only match if they were not.
is_contributor - true/false - if true, will only match if the author is a contributor/"approved submitter" in the subreddit. If false, will only match if they are not.
is_moderator - true/false - if true, will only match if the author is a moderator of the subreddit. If false, will only match if the author is NOT a moderator of the subreddit.
Actions
For submissions (base item or parent_submission sub-group):

action - A moderation action to perform on the item. Valid values are approve, remove, spam, filter, or report. filter is a unique action to AutoModerator, and will remove the post but keep it in the modqueue and unmoderated pages.
action_reason - Displays in the moderation log as a reason for why a post was approved or removed. If the action is report, displays as the report reason instead. Supports placeholders.
set_flair - Takes either a single string, a list of two strings or a dictionary. If given a single string, the submission's flair text will be set to the string. If given two strings, the first string will be used for the flair text, and the second string for the flair css class. If given a dictionary, the keys will be one of 'text', 'css_class', or 'template_id'. If set, the value of 'text' will be used for the flair text and the value of 'css_class' will be used for the css class. When using the dictionary syntax, 'template_id' must be set, and the value of 'template_id' will be used to set the flair template (template Ids are accessible in Post Flair and User Flair sections of Mod Tools). The flair text, flair css class and flair template id can include placeholders.
overwrite_flair - true/false - If true, a set_flair action will overwrite any previous link flair on the submission. If false (same as default behavior), any existing flair will not be overwritten.
set_sticky - true/false or a number - Sets or unsets the matched submission as a sticky in the subreddit. If you use a number (for example set_sticky: 1), the post will replace any existing sticky in that slot. Using true will work the same as clicking the "sticky this post" link on the post - it will go into the bottom sticky slot (replacing a post that's already there, if necessary).
set_nsfw - true/false - Enables (true) or disables (false) the NSFW flag on the submission.
set_spoiler - true/false - Enables (true) or disables (false) the spoiler flag on the submission.
set_contest_mode - true/false - Enables (true) or disables (false) contest mode for the submission's comments.
set_original_content - true/false – Enables (true) or disables (false) the OC (original content) flag on the submission.
set_suggested_sort - Sets the item's suggested comment sort. Valid values are best, new, qa, top, controversial, hot, old, random and blank (confidence is also available as an alias for best). Setting to blank is different than not setting at all - it will make it so that the user's default sort is used instead of the subreddit's (if the subreddit has one).
set_locked - true/false - Locks or unlocks the submission or comment.
For comments (base item only):

action - A moderation action to perform on the item. Valid values are approve, remove, spam, or report
report_reason - If the action is report, sets the report reason that will be used. Supports placeholders.
For users (inside author or crosspost_author sub-group):

set_flair - Takes either a single string, a list of two strings or a dictionary. If given a single string, the submission's flair text will be set to the string. If given two strings, the first string will be used for the flair text, and the second string for the flair css class. If given a dictionary, the keys will be one of 'text', 'css_class', or 'template_id'. If set, the value of 'text' will be used for the flair text and the value of 'css_class' will be used for the css class. When using the dictionary syntax, 'template_id' must be set, and the value of 'template_id' will be used to set the flair template (template Ids are accessible in Post Flair and User Flair sections of Mod Tools).
overwrite_flair - true/false - If true, a set_flair action will overwrite any previous user flair. If false (same as default behavior), any existing flair will not be overwritten.
Other directives
ignore_blockquotes - true/false - If set to true, any text inside blockquotes will not be considered by this rule when doing search checks against body, or counting length with body_shorter_than/body_longer_than.
Placeholders
When used inside a string that supports placeholders, these will be replaced with the appropriate value. For crossposts, the {{body}}, {{domain}}, and {{url}} are replaced by the value of the original submission. This allows including information about a post or its author in modmail or report reasons, setting flair to something based on the post that triggered it to be set, etc.

{{author}} - the author's name (do /u/{{author}} for a link to the author's user page)
{{author_flair_text}} - the author's flair text (will be replaced with nothing if they have no flair set, or have it disabled)
{{author_flair_css_class}} - the author's flair CSS class (will be replaced with nothing if they have no flair set, or have it disabled)
{{author_flair_template_id}} - the author's template id (will be replaced with nothing if they have no flair set, or have it disabled)
{{body}} - the full body text of the text submission or comment
{{permalink}} - a link to the item
{{subreddit}} - the subreddit's name (do /r/{{subreddit}} for a link to the subreddit)
{{kind}} - replaced with "submission" for submissions or "comment" for comments
{{title}} - the submission's title
{{domain}} - the submission's domain
{{url}} - the submission's full url
Media placeholders
Note that if you use a media placeholder anywhere in a rule, it will make it so that the rule is not applied to any objects where this data is not available.

{{media_author}} - the media's author username
{{media_author_url}} - the media's author url
{{media_title}} - the media's title
{{media_description}} - the media's description
Match placeholders
There is also one other special type of placeholder that can be used to show information about which words/phrases were matched by a search check on the base item (not search checks inside a sub-group like author: or parent_submission:). In its most basic form it is simply {{match}} and will be replaced with whichever option in your search check matched something in the item. For example, this condition would give a submission a flair css class corresponding to the color that they use in their title:

title: ["red", "green", "blue"]
set_flair: ["", "{{match}}"]
In the case of multiple search checks, you must specify which check to take the match from, or you may end up with unexpected behavior. For example, if the same rule also includes a search on domain, you should specify that you want the match from the title search with {{match-title}}:

title: ["red", "green", "blue"]
domain: [youtube.com, youtu.be]
set_flair: ["", "{{match-title}}"]
And finally, it is also possible to use the match placeholder to specify individual capture groups from a regular expression search check. This is done by adding the number of the capture group at the end of the placeholder, but be aware that {{match}} is the same as {{match-1}}, and will be replaced with the entire matched word/phrase. Capture groups defined inside your regex with parentheses start at {{match-2}}. You can also specify the specific search match along with this, such as {{match-title-2}}.

Standard conditions
Standard conditions allow you to make use of some pre-defined checks such as "image hosting sites" and "video hosting sites" that maintain a list of common domains, so that you do not need to manually define your own list. To use a standard condition, simply define standard: along with the check's name. You can only define a single standard condition inside a rule. For example, to remove submissions from common image hosts:

standard: image hosting sites
action: remove
The available standard conditions are:

image hosting sites - will match link submissions from common image hosting domains
direct image links - will match link submissions that link directly to image files (PNG, JPG, GIF, GIFV)
video hosting sites - will match link submissions from common video hosting domains
streaming sites - will match link submissions from common streaming domains
crowdfunding sites - will match link submissions from common crowdfunding domains
meme generator sites - will match link submissions from common meme-generator sites
facebook links - will match submissions or comments including links to Facebook
amazon affiliate links - will match submissions or comments including Amazon links with an affiliate





Library of Common Rules
New to AutoModerator? Unsure how to write a rule? This page is for you.

Introduction and General Notes
If you haven't yet, you'll first need to enable AutoModerator for your subreddit. All you need to do is go to /r/YOURSUBREDDIT/wiki/config/automoderator. The wiki system will ask you if you want to create the page. Say "yes", and you're good to go!

Some of these conditions can be directly copy-pasted and some will require filling in of custom details.

Some of these rules use modmail to alert moderators. On larger subreddits, you might find it less noisy to remove modmail (and modmail_subject if present) and change the rule to use action: filter. That has the effect of temporarily removing the submission or comment until a moderator can review it from the moderation queue.

When copying rules into your AutoModerator, --- separator lines must not be indented. While AutoModerator is flexible about line indentation as long as it is consistent, it is recommended that top-level lines be indented with 4 spaces and second-level lines with an additional 4 spaces.

Try to resist the temptation to add rules before there's evidence they're needed!

Commenting
Automatic Sticky Replies on Submissions
---
    # Sticky comment on submissions
    type: submission
    is_edited: false
    comment_stickied: true
    comment: |
        The text of the comment goes here.

        Put the same number of spaces at the beginning of each comment line.

        If you want separate paragraphs, keep the empty lines between each paragraph (AutoModerator uses [Markdown](https://www.reddit.com/wiki/markdown#wiki_quick_reference) formatting).
---
Automatic Sticky Replies Based on Flair
This rule only applies if the post is submitted with one of the listed flairs at the time of submission. AutoModerator does not reevaluate rules if the flair changes later.

You can change flair_text to ~flair_text if you want to reverse the flair check and only reply to submissions that are not flaired with one of the listed flairs.

---
    # Sticky comment on submissions
    type: submission
    is_edited: false # Don't act again if the post is edited
    flair_text (includes-word): ["Flair1", "Flair2"] 
    comment_stickied: true
    comment: |
        The text of the comment goes here (more explanation in the previous rule).
---
Content Control
These rules help restrict what can be posted.

Domain Blacklist
Prevent websites from being linked to or mentioned anywhere on your subreddit. Useful for banning phishing, spamming, or other malicious sites.

The use of action: spam removes the content and trains your subreddit spam filter to catch similar sites in the future. If you want to see these posts in your modqueue so you can ban these accounts, change action: spam to action: filter.

If the Domain Whitelist rule is also being used, remove domain+ from the first line of the rule because the Domain Whitelist rule handles submissions with a domain more broadly.

If you use a Domain Blacklist, it is a good idea to also use the URL Shortener Blacklist to prevent users from circumventing the blacklist with URL shorteners.

Replace the list between the brackets with your own list of sites to ban.

---
    domain+body+title: [badwebsite1.com, badwebsite2.com, badwebsite3.com]
    action: spam
    action_reason: "Spam domain [{{match}}]"
---
Subreddits with lots of youtube or other video submissions can add +media_description to also enforce the blacklist in the description of submitted videos:

---
    domain+body+title+media_description: [badwebsite1.com, badwebsite2.com, badwebsite3.com]
    action: spam
    action_reason: "Spam domain [{{match}}]"
---
Domain Whitelist
Only allow submissions to certain websites.

If you are also using the Domain Blacklist rule, remove the domain+ from the first line of that rule because this rule handles submissions with a domain more broadly (i.e., removes more domains).

Replace the list between the brackets with your own list of approved domains.

If you want to allow self posts (text posts), you can either add a domain of self.subredditname (replace subredditname with the name of your subreddit) or add the line type: link submission.

---
    ~domain: [site1.com, site2.com, site3.com]
    action: remove
    action_reason: "Unapproved domain [{{domain}}]"
    comment: |
        Your submission was automatically removed because {{domain}} is not an approved site.
---
Domain Un-Spam List
This approves submissions to known safe sites so they won't be caught in the spam filter:

---
    domain: [site1.com, site2.com, site3.com]
    action: approve
    action_reason: "Unspam domain [{{match}}]"
---
Subreddit Blacklist
Prevent certain subreddits from being linked to anywhere on your subreddit.

Replace the subreddit lists with your own list of subreddits to ban.

Change either or both rules from remove to filter if you want these submissions to be added to the moderation queue to allow a moderator to review the post or the account making the post.

The third removal rule is to prevent the use of short link formats to circumvent the subreddit blacklist.

 

---
    domain+url+body: [r/badsubreddit1, r/badsubreddit2]
    message: |
        Your submission was automatically removed because that is a disallowed link subreddit.
    action: remove
    action_reason: "Bad subreddit [{{match}}]"
---
    # Remove crossposts from disallowed subreddits
    type: crosspost submission
    crosspost_subreddit:
        name: [bannedsubreddit1, bannedsubreddit2]
    message: |
        Your submission was automatically removed because that is a disallowed crosspost subreddit.
    action: remove
    action_reason: "Crosspost from a disallowed subreddit"
---
    domain+url+body (regex): ['redd\.it/\w+', 'reddit\.com/comments/\w+']
    action: remove
    action_reason: "Reddit short link [{{match}}]"
    message: |
        Your {{kind}} in /r/{{subreddit}}) was automatically removed. Short links are not permitted in /r/{{subreddit}} as they impair our ability to enforce link blacklists.
---
Crosspost Whitelist
These rules will remove crossposts and link posts to subreddits that are not whitelisted.

---
    # Only allow crossposts from whitelisted subreddits
    type: crosspost submission
    crosspost_subreddit:
        ~name: [approvedsubreddit1, approvedsubreddit2]
    message: |
        Your submission was automatically removed because that is not an approved crosspost subreddit.
    action: remove
    action_reason: "Crosspost from unapproved subreddit"
---
    # Only allow link posts to whitelisted subreddits
    type: link submission
    url (regex): ['reddit\.com/r/(?!approvedsubreddit1|approvedsubreddit2)']
    message: |
        Your submission was automatically removed because that is not an approved link subreddit.
    action: remove
    action_reason: "Link post to an unapproved subreddit"
---
Uploaded media detection in comments
This regex can be used to detect images or gifs uploaded in comments

Using regex in automod to detect media in comments:

!\[(?:gif|img)\]\(([^\|\)]+(?:|\|[^\|\)]+))\)
Adding automoderator comment to media in comments:

type: comment
body (includes, regex): ['!\[(img|gif)\]\(((?!emote|static_png|giphy)[-\w\|]+)\)']
comment: "this is an image upload (and not an emote/giphy)!"
Using a filter for uploaded media in comments:

type: comment
body (regex, includes): ['!\[(?:gif|img)\]\(([^\|\)]+(?:|\|[^\|\)]+))\)']
action: filter
action_reason: "Media in comments"
Non-English Content Ban
These may be copied and pasted to your AutoModerator configuration without modification.

If donger is common on your subreddit, the first rule is not recommended.
The first rule matches about 75% to 80% of non-English spam on Reddit. The latter rules will not predict the language accurately, they are only intended to identify non-English content.
If you are experienced with AutoModerator and regex, the first rule may be adapted for use on non-English subreddits:

Remove any ranges in the first rule that may match on a language you want to allow. Note that many languages based on the Latin alphabet use characters from one or more Latin Extended Unicode ranges. Many languages also use the Combining Diacritical Marks Unicode range.
The additional rules are not recommended for use on non-English subreddits.
On English-only subreddits experiencing severe problems with non-English content, you may consider adding "(?#Latin-1 Supplement)(?-i:[ÀÁÃÄÆÇÈÊÍÎÐÑÓÖØÚÛÜÝÞßàãæëìîðòõøùúýþ]+)" to the first rule.

These rules are still under development and may be buggy. Use at your own risk.

---
    body+title (regex, includes): ["(?#Latin Extended-A)(?-i:[\u0100-\u017f]+)", "(?#Latin Extended-B)[\u0180-\u024f]+", "(?#Combining Diacritical Marks)[\u0300-\u0335\u0337-\u0360\u0362-\u036f]+", "(?#Cyrillic)[\u0400-\u052f]+", "(?#Hebrew)[\u0590-\u05ff]+", "(?#Arabic)[\u0600-\u0669\u066b-\u06ff]+", "(?#Devanagari)[\u0900-\u097f]+", "(?#Bengali)[\u0980-\u09ff]+", "(?#Gurmukhi)[\u0a00-\u0a7f]+", "(?#Tamil)[\u0b80-\u0bff]+", "(?#Kannada)[\u0c80-\u0cff]+", "(?#Thai)[\u0e00-\u0e7f]+", "(?#Latin Extended Additional)[\u1e00-\u1eff]+", "(?#Hiragana)[\u3041-\u3096]+", "(?#Katakana)[\u30a1-\u30c3\u30c5-\u30fa]+", "(?#CJK Unified Ideographs)[\u4e00-\u9fff]+", "(?#Hangul)[\uac00-\ud7af]+"]
    action: filter
    action_reason: "Non-English [{{match}}]"
---
    type: submission
    title+body (regex, includes): ['(?-i:[ÀÂÆÇÈÉÊËÎÏÔÙÛÜàâæçèêëîïôùûüÿŒœŸ])']
    body+title (regex): ['(?<!\bdu.)jours?', '(?<!\blaissez.)faire', 'a(insi|lors|ucune|ujourd[\x27’]hui|ussi|utres?|vait|vec|voir)', 'b(iens?|onnes?)', 'c([\x27’]est(?!.magnifique\b)|ela|es|ette|hez|omme|omptes?|ontre)', 'd([\x27’]autres|[\x27’]un|[\x27’]une|ans|epuis|eux|its?|onc|roite)', 'e(ffets?|lles?|ntre|ntreprises?)', 'f(aits?|aut|ois)', 'gauche', 'ils', 'j([\x27’]ai|amais)', 'l([\x27’]on|es|eurs?|oi|ui)', 'm(ais|oi|oins|ois|onde)', 'n([\x27’]a|[\x27’]est|iveau|ous|ouveau|ouvelles?)', 'oui', 'p(artie|as|ersonnes?|eu|eut|euvent|eux|ourquoi|roduits?|utain)', 'qu([\x27’]ils?|[\x27’]on|and|elles?|elques|els?|i|oi)', 'r(este|ien)', 's([\x27’]est|elon|erait|oit|ont|ouvent|uis|ur)', 't([\x27’]as|[\x27’]es|ermes?|itres?|oujours?|ous|outes?|rois|rop|rouves?)', 'une', 'v(ais|ers|oir(?!.dire\b)|ous)']
    action: filter
    action_reason: "Non-English (French) [{{match-title+body}}], [{{match-body+title}}]"
---
    type: submission
    title+body (regex, includes): ['[ÄÖÜßäöü]']
    body+title: ['(aber|alles|als|auch|auf|bei|bist|bitte|damit|danke|dann|dass|dein|deine|dem|denn|der|des|diese|dieser|dir|doch|ein|eine|einem|einen|einer|einfach|etwas|euch|frau|ganz|gehen|geht|gesagt|gibt|gott|hab|haben|hast|hatte|heute|hier|ihm|ihn|ihnen|ihr|immer|jetzt|kann|kannst|kein|keine|komm|kommen|kommt|leben|leute|los|machen|mehr|meine|meinen|mich|mit|nein|nicht|nichts|nie|noch|nur|oder|sagen|schon|sehen|sehr|sein|sich|sicher|soll|und|uns|viel|von|vor|warum|wenn|werde|werden|wie|wieder|willst|wirklich|wissen|wollen|wollte|wurde|zeit|zum|zur)']
    action: filter
    action_reason: "Non-English (German) [{{match-title+body}}], [{{match-body+title}}]"
---
    type: submission
    title+body (regex, includes): ['(?-i:[¡ªº¿ÀÁÂÃÇÈÉÊÌÍÑÒÓÔÕÙÚÜàáâãçèêìíñòóôõùúü])']
    body+title (regex): ['a(lgo|cha|cho|hora|inda|lguém|lguien|nos|penas|qui|ssim|té)', 'b(em|ueno)', 'c(asa|erto|oisa|oisas|omo|osa|osas|reo|uando)', 'd(ecir|epois|esde|espués|eus|eve|ia|ije|ijo|ios|isse|izer|ois|onde)', 'e(la|le|les|llos|ntonces|res|sa|se|so|spera|ssa|sse|sta|staba|stamos|star|stas|stava|ste|sto|stou|stoy)', 'f(alar|az|azendo|azer|icar|oi|ue|uera)', 'g(ente|racias)', 'h(ablar|ace|acer|echo|ijo|ola|ombre|omem)', 'i(sso|sto)', 'l(he|ugar)', 'm(ais|ejor|elhor|esmo|eu|ierda|inha|is|ismo|omento|ucho|uito|undo|uy)', 'n(ada|adie|em|oche|oite|os|osotros|unca)', 'o(brigado|nde|tra|tro)', 'p(ai|arece|asa|elo|ero|essoas|ode|odemos|or|orque|osso|ouco|ra|reciso|uede|uedes|uedo)', 'qu(al|ando|é|em|er|ero|ién|iere|ieres|iero)', 's(abes|eguro|ei|em|empre|enhor|eu|eus|iempre|iento|obre|ua)', 't(alvez|ambém|ambién|em|emos|enemos|engo|enho|er|iempo|iene|ienes|inha|ipo|odo|odos|rabajo|udo|us)', 'u(ma|no|sted)', 'v(amos|er|erdad|erdade|ez|ida|ou|oy)']
    action: filter
    action_reason: "Non-English (Spanish or Portuguese) [{{match-title+body}}], [{{match-body+title}}]"
---
Spam Obfuscations
Spammers often try to obfuscate text by replacing letters with similar-looking characters from various Unicode regions. This rule will also match on some non-English languages.

On English-only subreddits experiencing severe problems with spam obfuscations, you may consider adding "(?#Latin-1 Supplement)(?-i:[ÀÁÃÄÆÇÈÊÍÎÐÑÓÖØÚÛÜÝÞßàãæëìîðòõøùúýþ]+)" to this rule.

This rule is still under development and may be buggy. Use at your own risk.

---
    body+title (regex, includes): ["(?#Latin Extended-A)(?-i:[\u0100-\u017f]+)", "(?#Latin Extended-B)[\u0180-\u024f]+", "(?#IPA Extensions)[\u0250-\u02af]+", "(?#Spacing Modifier Letters)[\u02b0-\u02ff]+", "(?#Combining Diacritical Marks)[\u0300-\u0335\u0337-\u0360\u0362-\u036f]+", "(?#Greek and Coptic)[\u0370-\u03ff]+", "(?#Cyrillic)[\u0400-\u052f]+", "(?#Armenian)[\u0530-\u058f]+", "(?#Cherokee)[\u13a0-\u13ff]+", "(?#Unified Canadian Aboriginal Syllabics)[\u1400-\u167f]+", "(?#Phonetic Extensions)[\u1d00-\u1d7f]+", "(?#Phonetic Extensions Supplement)[\u1d80-\u1dbf]+", "(?#Latin Extended Additional)[\u1e00-\u1eff]+", "(?#Greek Extended)[\u1f00-\u1fff]+", "(?#Letterlike Symbols)(?-i:[\u2100-\u214f]+)", "(?#Number Forms)[\u2160-\u218b]+", "(?#Enclosed Alphanumerics)[\u2460-\u24ff]+", "(?#Glagolitic)[\u2c00-\u2c5f]+", "(?#Latin Extended-C)[\u2c60-\u2c7f]+", "(?#Coptic)[\u2c80-\u2cff]+", "(?#Latin Extended-D)[\ua720-\ua7ff]+", "(?#Latin Extended-E)[\uab30-\uab6f]+", "(?#Cherokee Supplement)[\uab70-\uabbf]+", "(?#Halfwidth and Fullwidth Forms)[\uff00-\uff0c\uff0e-\uffef]+", "(?#Mathematical Alphanumeric Symbols)[\U0001D400-\U0001D7FF]+", "(?#Enclosed Alphanumeric Supplement)[\U0001F100-\U0001F1FF]+"]
    action: filter
    action_reason: "Possible spam obfuscations or non-English [{{match}}]"
---
URL Shortener Ban
If you use the Domain Blacklist rule, we recommend also using this rule to prevent blacklist circumvention.

---
    domain+body+title: ['http://redd.it', 'https://redd.it', 0rz.tw, 1jl.info, 1link.in, 1un.fr, 1url.com, 1url.cz, 1wb2.net, 2.gp, 2.ht, 2big.at, 2doc.net, 2fear.com, 2pl.us, 2tu.us, 2u.xf.cz, 2ya.com, 3.ly, 3x.si, 4ms.me, 4sq.com, 5z8.info, 6g6.eu, 7.ly, 7li.in, 8u.cz, a.co, a.gg, a.nf, a0.fr, a2n.eu, aa.cx, abbrr.com, abnb.me, ad-med.cz, ad.vu, ad5.eu, ad7.biz, adb.ug, adcraft.co, adcrun.ch, adf.ly, adfa.st, adflav.com, adjix.com, adv.li, afx.cc, aka.gr, alturl.com, amzn.to, any.gs, app.link, app.x.co, apple.news, ar.gy, asso.in, atu.ca, azc.cc, b23.ru, b2l.me, b54.in, b65.us, bc.vc, bcool.bz, beam.to, bee4.biz, bfy.tw, bigly.us, bim.im, binged.it, bit.do, bit.ly, bitly.com, bitw.in, bizj.us, bkite.com, bl.ink, blap.net, ble.pl, blip.tv, bote.me, bougn.at, bravo.ly, brk.to, brzu.net, bsa.ly, bst.is, budurl.com, buff.ly, burnurl.com, bv.ms, bxl.me, bzh.me, canurl.com, cbug.cc, cc.cc, cektkp.com, cf2.me, cf6.co, chilp.it, chzb.gr, cjb.net, cl.ly, clck.ru, cli.gs, cli.re, cliccami.info, clickmeter.com, clickthru.ca, clikk.in, clk.im, clnk.in, cnn.it, conta.cc, cort.as, cot.ag, crisco.com, crks.me, crwd.cr, ctvr.us, cur.lv, cutt.eu, cutt.ly, cutt.us, cuturl.com, cybr.fr, cyonix.to, dai.ly, db.tt, dd.ma, decenturl.com, dfl8.me, dft.ba, digbig.com, digg.com, disq.us, dld.bz, dlvr.it, do.my, dopice.sk, doshort.com, droid.ws, dwarfurl.com, dy.fi, dyo.gs, easyurl.com, easyurl.net, ebay.to, ecra.se, eepurl.com, erw.cz, esyurl.com, eweri.com, exe.io, ezurl.cc, fa.by, fav.me, fb.me, fbshare.me, ff.im, fhurl.com, filoops.info, filz.fr, fire.to, firsturl.de, firsturl.net, fivr.me, flic.kr, flq.us, fly2.ws, freze.it, fur.ly, fvrr.co, fwd4.me, fwib.net, g.co, g00.me, geniuslink.com, get-shorty.com, gg.gg, gizmo.do, go.9nl.com, go.ign.com, go.usa.gov, go2.me, go2cut.com, golinks.co, goo.gl, goshrink.com, gowat.ch, gurl.es, hellotxt.com, hex.io, hide.my, hiderefer.com, hit.my, hmm.ph, hops.me, hover.com, href.li, hsblinks.com, ht.ly, htxt.it, hubs.ly, huff.to, hurl.it, hyperurl.co, icit.fr, ick.li, icks.ro, idek.net, ift.tt, iguang.tw, iiiii.in, iky.fr, ilix.in, is.gd, iscool.net, itm.im, ity.im, ix.lt, ix.sk, j.gs, j.mp, jdem.cz, jmp2.net, jqw.de, just.as, kask.us, kd2.org, kfd.pl, kissa.be, korta.nu, kr3w.de, kratsi.cz, krod.cz, krunchd.com, kuc.cz, l-k.be, l9.fr, l9k.net, labb.in, lat.ms, lc-s.co, lc.cx, lemde.fr, libero.it, liip.to, liltext.com, linkbun.ch, linkto.im, linktr.ee, linx.cf, llu.ch, lnk.co, lnk.ms, lnk.sk, lnkd.in, lnks.fr, lru.jp, lt.tl, m3mi.com, macte.ch, mailchi.mp, mcaf.ee, mdl29.net, merky.de, metamark.net, mic.fr, migre.me, mke.me, mktw.net, moby.to, mol.im, moourl.com, more.sh, mrte.ch, myurl.in, mz.cm, n.pr, nanoref.com, nbc.co, nblo.gs, net46.net, nicou.ch, nig.gr, not.my, notlong.com, nov.io, nq.st, nsfw.in, nutshellurl.com, nyti.ms, o-x.fr, oc1.us, okok.fr, on.mktw.net, onelink.me, onforb.es, oua.be, ow.ly, oze.io, p6l.org, parky.tv, past.is, ph.ly, picz.us, pin.st, ping.fm, plots.fr, pm.wu.cz, po.st, politi.co, poprl.com, post.ly, posted.at, ppt.cc, ppt.li, prettylinkpro.com, ptiturl.com, ptm.ro, pub.vitrue.com, q.gs, qbn.ru, qicute.com, qlnk.net, qqc.co, qqurl.com, qr.ae, qr.net, qrtag.fr, qte.me, quip-art.com, qxp.sk, qy.fi, r.im, rb.gy, rb6.me, read.bi, readthis.ca, redirects.ca, redirx.com, redu.it, ref.so, relink.fr, reut.rs, rite.link, rsmonkey.com, rt.nu, rurl.org, rx.hu, s-url.fr, safe.mn, sagyap.tk, scrnch.me, sdu.sk, sdut.us, sh.st, shar.as, shar.es, sharein.com, sharetabs.com, shink.de, shor.by, shorl.com, short.cm, short.pk, short.to, shorte.st, shorten.me, shortenurl.com, shorterlink.com, shortn.me, shortna.me, shorturl.at, shorturl.com, show.my, shredurl.com, shrinke.me, shrinkify.com, shrinkr.com, shrinkurl.us, shrt.fr, shrt.in, shrten.com, shrtnd.com, shurl.net, sicax.net, simurl.com, sina.lt, skroc.pl, slate.me, smallr.com, smarturl.it, smsh.me, snip.ly, snipr.com, snipurl.com, snsw.us, snurl.com, soo.gd, sq6.ru, sqrl.it, srnk.net, starturl.com, sturly.com, surl.co.uk, surl.me, sy.pe, t.cn, t.co, t.lh.com, t.me, t2m.io, tabzi.com, tcrn.ch, tdjt.cz, tgr.ph, thn.li, tighturl.com, tiks.co, tin.li, tiny.cc, tiny.lt, tiny.pl, tiny.tw, tinyarrows.com, tinylink.com, tinylink.in, tinyurl.com, tinyurl.hu, tl.gd, tldr.sk, tmi.me, tnw.to, tny.com, tny.cz, to.ly, to8.cc, togoto.us, tohle.de, tpmr.com, tprt.co, tr.im, tr5.in, tra.kz, traceurl.com, trck.me, trunc.it, tweetburner.com, tweez.me, twet.fr, twhub.com, twirl.at, twitclicks.com, twitterpan.com, twiturl.de, twurl.cc, twurl.nl, tyn.ee, u.mavrev.com, u.nu, u.to, u6e.de, ug.cz, ukl.me.uk, upzat.com, ur1.ca, url.ie, url.lotpatrol.com, url4.eu, url4u.co, url5.org, urladda.com, urlao.com, urlborg.com, urlcut.com, urlcutter.com, urlhawk.com, urlin.it, urlpire.com, urls.fr, urls.tn, urltea.com, urlx.ie, urlz.fr, usat.ly, utfg.sk, v.gd, v.ht, vaza.me, vbly.us, vd55.com, verd.in, vgn.am, vgn.me, viralurl.biz, viralurl.com, virl.ws, vm.lc, vov.li, vrl.to, vt802.us, vur.me, vurl.bz, vurl.com, vzturl.com, w1p.fr, w55.de, wa.link, wa.me, waa.ai, wapo.st, wb1.eu, web99.eu, wed.li, win.gy, work.ink, workink.co, wp.me, wu.cz, ww7.fr, x.co, x.vu, x2c.eu, xaddr.com, xav.cc, xil.in, xl8.eu, xoe.cz, xr.com, xrl.in, xrl.us, xtu.me, xurl.es, yatuc.com, yeca.eu, yfrog.com, yhoo.it, yiyd.com, yogh.me, youfap.me, yourls.org, yourname.shim.net, ysear.ch, yuarel.com, yweb.com, yyv.co, z0p.de, z9.fr, zapit.nu, zeek.ir, zi.ma, zi.mu, zi.pe, zip.net, zud.me, zurl.ws, zxq.net, zz.gd, zzb.bz]
    action: remove
    action_reason: "URL shortener [{{match}}]"
    message: "Your {{kind}} has been removed because you used a URL shortener ({{match}}). Please only use direct and full-length URLs."
---
Crowdfunding
This rule can be copy-pasted directly to your AutoModerator configuration without modification.

---
    body+domain+title+url: [begslist.com, booster.com, cash.app, cash.me, charityvest.org, crowdfunder.co.uk, crowdrise.com, donorschoose.org, firstgiving.com, fnd.us, fundanything.com, fundly.com, fundrazr.com, generosity.com, gf.me, gfwd.at, givealittle.co.nz, giveforward.com, givesendgo.com, gofund.me, gofundme.com, goget.fund, gogetfunding.com, igg.me, indiegogo.com, justgiving.com, kck.st, ketto.org, kickbooster.me, kckb.st, kickstarter.com, launchfinance.com.au, m-lp.co, patreon.com, payfriendz.me, payit2.com, payitsquare.com, paypal.com/cgi-bin, paypal.com/paypalme, paypal.me, petcaring.com, pitchfuse.com, redditmade.com, sponsorchange.org, tilt.com, tilt.tc, totalgiving.co.uk, youcaring.com, youcaring.net, youcaring.org]
    action: filter
    action_reason: "Crowdfunding [{{match}}]"
---
Petitions
---
    body+title: [act.rootsaction.org, actblue.com, action.sumofus.org, activism.thenation.com, avaaz.org, change.org, chn.ge, credomobilize.com, demandprogress.org, easypolls.net, go.berniesanders.com, gopetition.com, leftaction.com, moveon.org, petitions.whitehouse.gov, signon.org, startjoin.com, strawpoll.me, takepart.com, thepetitionsite.com, watchdog.net]
    action: remove
    action_reason: "Petition [{{match}}]"
    comment: "Your {{kind}} has been removed. Petitions aren't allowed here."
---
Surveys and Polls
---
    body+title+url (regex): ['(dashpoll|midzy|qualtrics|typeform)\.com', '[\w.-]*(strawpoll|survey)[\w.-]*\.(com?|me|uk)(\.[\w-]+)*', 'crowdsignal\.com', 'docs\.google\.com/(a/[^/]+/)?forms(?=/)', 'forms\.gle', 'instant\.ly', 'reddit\.com/poll', 'survey\.fm', 'survey\.zohopublic\.com', 'survio\.com', 'wufoo\.com/forms']
    action: remove
    action_reason: "Survey link [{{match}}]"
    comment: "Your {{kind}} has been removed. Surveys and polls aren't allowed here."
---
Require Direct Image Links
This is a set of several rules which work together to remove image-hosting links that do not play nicely with RES and mobile apps, and, where possible, generates a direct link for the user to re-submit. Two of the rules are for imgur, which has several different types of URL formats.

This set of five rules can be copy-pasted directly to your AutoModerator configuration without modification.

---
    domain: [gyazo.com, ibb.co, imageshack.us, pinterest.com, postimg.cc, postimg.org, prnt.sc, prntscr.com, puu.sh]
    ~url (ends-with): [.gif, .jpeg, .jpg, .png]
    action: remove
    action_reason: "Indirect link to hosted image #1 [{{url}}]"
    comment: |
        Your submission has been automatically removed due to an indirect link to a hosted image.

        Please be considerate of mobile and RES users, and resubmit your link with the proper file extension.

        For your convenience, here is your submitted link with a .png file extension appended to the end. Please check that it works. If it does, retry your submission with this link:

        {{url}}.png

        If the above link does not work, right-click on your image, select *Copy Image URL*, and paste that into the reddit submission page instead.
---
    domain: [imgur.com]
    url (regex): ['imgur\.com/(a/)?[A-Za-z0-9]{5,8}$']
    action: remove
    action_reason: "Indirect link to hosted image #2 [{{url}}]"
    comment: |
        Your submission has been automatically removed due to an indirect link to a hosted image.

        Please be considerate of mobile and RES users, and resubmit your post as a direct link.

        For your convenience, here is your submitted link with .jpg and .gif file extensions appended to the end. Please see if one works, and re-try your submission with one of the following links:

        * {{url}}.jpg
        * {{url}}.gif

        If the above links do not work, right-click on your image, select *Copy Image URL*, and paste that into the reddit submission page.
---
    domain: [imgur.com]
    url (regex): ['gallery', 'imgur\.com/[A-Za-z0-9]{5,8},([A-Za-z0-9]{5,8},?)+']
    action: remove
    action_reason: "Indirect link to hosted image #3 [{{url}}]"
    comment: |
        Your submission has been automatically removed due to an indirect link to a hosted image.

        Non-album multi-image links and imgur gallery links are not compatible with RES and mobile apps.

        For multi-image links, please create an album and submit a link to that.

        For gallery images, please right-click your image, choose *Copy Image URL*, and submit that direct image link to reddit.
---
    domain: [imgflip.com, pinterest.com, snag.gy, uput.in]
    ~url: [i.imgflip.com, i.snag.gy, i.uput.in]
    action: remove
    action_reason: "Indirect link to hosted image #4 [{{url}}]"
    comment: |
        Your submission has been automatically removed due to an indirect link to a hosted image.

        Please right-click your image, choose *Copy Image URL*, and submit that direct image link to reddit.
---
    domain: [tinypic.com]
    action: remove
    action_reason: "Indirect link to hosted image #5 [{{url}}]"
    comment: |
        Your submission has been automatically removed due to an indirect link to a hosted image.

        Unfortunately, the media host {{domain}} is not compatable with mobile apps and/or RES. Please be considerate of mobile and RES users and resubmit your content using a different media host.
---
Profanity Filter
This filters variants of common vulgarity including semi-censored variants and some common Spanish profanity.

This rule can be copy-pasted directly to your AutoModerator configuration without modification, but some fine-tuning may be required.

---
    title+body (regex): ['((bul+|dip|horse|jack).?)?sh(\\?\*|[ai]|(?!(eets?|iites?)\b)[ei]{2,})(\\?\*|t)e?(bag|dick|head|load|lord|post|stain|ter|ting|ty)?s?', '((dumb|jack|smart|wise).?)?a(rse|ss)(.?(clown|fuck|hat|hole|munch|sex|tard|tastic|wipe))?(e?s)?', '(?!(?-i:Cockburns?\b))cock(?!amamie|apoo|atiel|atoo|ed\b|er\b|erels?\b|eyed|iness|les|ney|pit|rell|roach|sure|tail|ups?\b|y\b)\w[\w-]*', '(?#ES)(cabr[oó]n(e?s)?|chinga\W?(te)?|g[uü]ey|mierda|no mames|pendejos?|pinche|put[ao]s?)', '(?<!\b(moby|tom,) )(?!(?-i:Dick [A-Z][a-z]+\b))dick(?!\W?(and jane|cavett|cheney|dastardly|grayson|s?\W? sporting good|tracy))s?', '(cock|dick|penis|prick)\W?(bag|head|hole|ish|less|suck|wad|weed|wheel)\w*', '(f(?!g\b|gts\b)|ph)[\x40a]?h?g(?!\W(and a pint|ash|break|butt|end|packet|paper|smok\w*)s?\b)g?h?([0aeiou]?tt?)?(ed|in[\Wg]?|r?y)?s?', '(m[oua]th(a|er).?)?f(?!uch|uku)(\\?\*|u|oo)+(\\?\*|[ckq])+\w*', '[ck]um(?!.laude)(.?shot)?(m?ing|s)?', 'b(\\?\*|i)(\\?\*|[ao])?(\\?\*|t)(\\?\*|c)(\\?\*|h)(e[ds]|ing|y)?', 'c+u+n+t+([sy]|ing)?', 'cock(?!-ups?\b|\W(a\Whoop|a\Wsnook|and\Wbull|eyed|in\Wthe\Whenhouse|of\Wthe\W(rock|roost|walk))\b)s?', 'd[o0]+u[cs]he?\W?(bag|n[0o]zzle|y)s?', 'piss(ed(?! off)(?<!\bi(\sa|\W?)m pissed)|er?s|ing)?', 'pricks?', 'tit(t(ie|y))?s?']
    action: filter
    action_reason: "Profanity [{{match}}]"
---
After a sufficient period of testing, you may consider replacing the latter two lines with the following:

---
    action: remove
    action_reason: "Profanity [{{match}}]"
    message: |
        Your [{{kind}}]({{permalink}}) in /r/{{subreddit}} was automatically removed.

        /r/{{subreddit}} is geared towards younger users so please watch your language.
---
You can optionally change the message to better suit your particular subreddit.

Match Multiple Keywords
To match multiple keywords from separate lists being checked on the same field(s), add a # name to the check. Without the # name, each subsequent check of the same type will overwrite the previous check of that type.

Do not use a number as the # name because that can break {{match}} placeholders in some situations.

---
    title+body#color: ['blue', 'green', 'red']
    title+body#shape (regex): ['circles?', 'squares?', 'triangles?']
    action: filter
    action_reason: "Colored shape filter [{{match-title+body#color}}] [{{match-title+body#shape}}]"
---
This can also be done with regular expressions:

---
    title+body (regex): ['\b(blue|green|red)\b.*?\b(circle|square|triangle)s?\b', '\b(circle|square|triangle)s?\b.*?\b(blue|green|red)\b']
    action: filter
    action_reason: "Colored shape filter [{{match}}]"
---
Another option is using positive-lookahead in a regex, but this is only recommended if you are experienced with more complex regular expressions:

---
    title+body (regex): ['^(?=.*?\b(blue|green|red)\b).*?\b(circle|square|triangle)s?\b']
    action: filter
    action_reason: "Colored shape filter [{{match}}]"
---
Content Quality Control
These rules focus on low-effort or low-quality content (e.g., "shitposts").

Common Clickbait Titles
This rule flags posts which may be "clickbait" (low-effort articles intended to generate clicks and ad revenue rather than provide meaningful information).

The original version of this rule was based on this submission from /r/dataisbeautiful.

---
    title+media_title (regex): ['(10|\d+\b(?<!covid.19)|five|four|one|seven|simple|six|three|two) ((\w+ )?(?-i:Ways)|easy|best|free|main|money|reasons?|steps)', '([5-9]|\d\d+|five|seven|simple|six) (\w+ )?ways', '(\d+|five|four|one|only|pro|seven|simple|six|this|three|two|weird)(\W[\w\x27-]{3,})?\W((pro\W?)?tips|things? (every\w*|one|only|you\w*)|trick)s?', '(photos|pictures|images) that prove', '\d{1,2} (signs|reasons) (you(\W?re)?|why)', '\d{1,2} dogs who', '\d{1,2} most important', '\d{1,2} things that', 'are the most', 'before you die', 'blow your mind', 'character are you', 'd(id|o)n\W?t know about', 'game of thrones', 'in real life', 'in your life', 'is this the', 'probably d(id|o)n\W?t know', 'reasons you should', 'things that (actually |really )?happen(ed)?', 'things you d(id|o)n\W?t', 'things you probably', 'will blow your', 'you probably d(id|o)n\W?t', 'you should be']
    action: report
    action_reason: "Possible clickbait [{{match}}]"
---
Short Top-Level Comments
Comments below a certain length are unlikely to contribute to discussion. Depending on the needs of your subreddit, you may want to remove such comments.

This rule removes top-level comments that are less than 11 characters.

This rule can be copy-pasted directly to your AutoModerator configuration without modification. Optionally, you can adjust the required comment length. If you want to remove all comments below the threshold, rather than just top-level comments, remove the is_top_level line. If you want this to apply to text-posts as well, remove the type line.

---
    type: comment
    body_shorter_than: 11
    is_top_level: true
    action: remove
    action_reason: "Short top-level comment"
---
Link-only Self Posts
This rule can be copy-pasted directly to your AutoModerator configuration without modification.

---
    type: text submission
    body (regex, full-text): ['(\[[^\]]*\]\()?https?://\S+\)?']
    action: remove
    action_reason: "Link-only self post"
---
Self Posts without Text
This rule can be copy-pasted directly to your AutoModerator configuration without modification.

---
    type: text submission
    body_shorter_than: 1
    action: remove
    action_reason: "Self post without text"
---
Walls of Text
This rule sends a message in response to submissions and comments that have really long paragraphs because they may be difficult to read.

This rule can be copy-pasted directly to your AutoModerator configuration without modification. Some subreddits may want to add an action: filter and action_reason line to allow moderators to review matching submissions and comments.

---
    body (regex, includes): ['[^\n]{2000}', '^\W*[^\n]{1750,}\W*$']
    message: "Please add some paragraph breaks to [your {{kind}}]({{permalink}}) by placing a blank line between distinct sections."
---
Comments that are only "MRW" or "MFW" links
---
    type: comment
    body (regex, full-text): ['\[M[RF]W\]\(https?://\S+\)']
    action: remove
    action_reason: "Comment that is only MRW/MFW and a link"
---
Mobile Links
---
    domain (starts-with): [m., mobile.]
    action: remove
    action_reason: "Mobile link [{{domain}}]"
    comment: |
        Your submission was automatically removed because you linked to the mobile version of a website.

        Please submit a non-mobile link instead.
---
Comments that are just /r links
---
    type: comment
    body (regex, full-text): ['/?r/\w+']
    action: remove
    action_reason: "Comment is just /r link [{{match}}]"
---
Short and Senseless Memes
Removes "circlejerky" comments.

This rule is a little aggressive and may not be suitable for "less than serious" subreddits. Use at your own risk.
For more serious subreddits, it might be acceptable to increase the body_shorter_than to 60 characters.
This can be copy/pasted directly to AutoModerator configuration without modification.
For smaller subreddits, you could replace action: remove with action: report or action: filter.
 

---
    type: comment
    body (regex): ['((nick)?name|account)( \S+){0,2}\W+check\w*\W?out', '(3|th?ree)\b.{0,10}\bfi(dd?|ft)y', '(?!carl\b)c[ao]+r+l+', '(?!passwords?\b)p[4a][$5s]{2}\W?w[0o]rd\w*', '(?-i:BOFA)', '(?<!.{32})(?<!( car| job|aged|gher|lea[nr]|nior|uilt|vage) )titles?(?!.*\b(car|company|fee|insurance|job|loan|vehicle)s?\b)', '(?<!\.)(?<!rule of )69(?!( (days|years)|[,.]))', '(?<!thank )(yo)?u sir', '(?<=\$)750', '(\d+|three|too|two)\W?(deep|edge?|meta|spice?|spook|spoop)y?\W?(\d+|for)\W?me', '(\w{3,}|u) had one job', '(^\S*|chop|cut)\w* ?onions(?!,)', '(and|or)\W+my\W+axe?', '((bul+|dip|horse|jack).?)?sh(\\?\*|[ai]|(?!(eets?|iites?)\b)[ei]{2,})(\\?\*|t)e?(s|ty)?', '(chad|karen|nancy)s?', '(comment|post|story|this) (checks out|gave me (\w+\W+){0,2}(aids|autism|cancer)|kills the|will be downvoted)', '(deleted|removed) comments?', '(dia-?)?beet-?us', '(dick|penis) (stuck|in crazy)', '(down|up)\W?(boat|doot|vot)\w*', '(do|lik) dis', '(enter|join)ed (the )?chat\w*', '(gentleman|scholar) and a? ?(gentleman|scholar)', '(i|u|you) (just )?lost the game', '(mis)?read th(at|is) as', '(nope[,.]? ?){2,}', '(tb[fh]|tho)(?=\W*$)', '(top.?)?kek', '(yo(u|u are|u\Wre|ur(?! ass\b)|ure)|ur) ?(argue|look|may|might|must|seem|sound|talk|write)? ?(be|like)? ?(an?|the)? ?(\w+ly|fucking|poor|very)? ?((dumb|jack)?a(rse|ss)\W?(clown|fuck|hat|hole|munch|sex|tard|tastic|wipe)?|bastard|bitch|cunt|delusional|dick|dimwit|disgusting|dolt|douche|dumb|fool(ish)?|fuck(?!ing)\w+|idiot|imbecile|inbred|jerk|loser|moron|naive|narcissist\w*|nitwit|pathetic|queer|schmuck|scum\w*|st[ou]+pid|waste of \w+)(es|s)?', '(yo)?u ?w[0oau]t ?m[8a]t?e?', '(yo)?u can\W*t explain that', '(yo)?u lucky', '(yo)?u monster', '(yo)?u must be new', '(yo)?u tagged as', '(yo)?u wouldn\W*t download an?', '(yo)?u[.,]? I like (yo)?u', '0.?1.?1.?8.?9.?9.?9.?8.?8.?1.?9.?9.?9.?1.?1.?9.?7.?2.?53?', '0bama\w*', '[0o][._][0o]', '[ah]{12,}', '[bg]tfo', '[bm]?wa+h[ah]*', '[dh]urr?', '\d+/10', '\d+[a-z]+\d+me', '\w*pikachu\w*', '\w{3,} as fu[ck]{1,2}', '^((my|o+[uw]+c+h+|o+w+|oo+f+)[ie]*(\b|\s)){2}', '^(\S+ ){1,5}is leaking', '^(\W*(420|69|no*i+c+e+))+\W*$', '^R\.?I\.?P(\b|\.)', '^ay+', '^better call', '^classic', '^good bot', '^that\W*s true\W*$', '^thirded', '^this guy', '^til', '^um+', '^what do(?=\?\s*$)', 'af', 'anall?y?', 'are (yo)?u (fucking sorry|me)', 'ass', 'babby', 'bae(?!\Wsystems)', 'banana.?(4|for).?scale', 'be (un)?attractive.{1,30}be (un)?attractive', 'bitch\w*', 'blackjack and hookers', 'blew', 'bljad', 'boners?', 'book\W?mark(ing|ed)?', 'br(ea|o)k(en?|ing|s)? (both )?(of )?((his|my|your) )?arms', 'br[aou]+h?', 'bs', 'bubbles', 'c(ontrol|trl)\W{1,3}F', 'c[ao]n?stanza', 'came (here )?(\w+ )?to (post|say) (that|this)', 'can confirm(?=\W*($|[,.]|am\b))', 'can\W*t? fap to this', 'cat\W?facts?', 'challenge accepted', 'christ', 'chuck testa', 'claps?', 'comment (apocalypse|graveyard)', 'comment(ed|ing) (to|for)', 'cool (story|theory)', 'd[0o]nger', 'damn onions', 'damn', 'dank(est)?', 'dat \w{3,} doe', 'dat', 'dawg', 'delete facebook', 'dick', 'did nazi that c[ou]m+ing', 'ding', 'dis', 'disappoint\w*', 'doesn\W*t matter\W+had sex', 'doin[\Wg]? god\W*s work', 'don\W*t let your dreams be (dream|meme)s', 'drugs?', 'dumb', 'enough (internet|reddit) for', 'epsteins?', 'erin', 'fails?', 'faith in humanity', 'fam', 'feels good man', 'florida.?man', 'for science', 'front page', 'frozen soap', 'ftfy', 'fuck\w*', 'gave me cancer', 'gg\W?wp', 'gig+it+y', 'got\W*e+m+', 'gotta', 'gud jub', 'harambe', 'hero', 'hit (the )?gym', 'hold my\b.{0,36}\bi\W?m goin.? in', 'holy', 'hot pockets?', 'hunter2', 'i (c|see) wh?[auo]t (yo)?u did th[ea]re?', 'i\W?ll just leave this here', 'idk', 'imh?o', 'in soviet russia', 'intensifies', 'it went ok(ay)?', 'it\W*s happening', 'jesus', 'jimmies', 'just the tip', 'kanye', 'karma', 'kek[ek]*s?', 'kills? (it )?with fire', 'knawledge\w*', 'know that feel', 'kobe(?!.beef)', 'l(?!ull(ed|ing|s)?\b)[ou]l[ol]*([sz]|e?d|ing|no(pe)?|wh?[au]t)*', 'laugh', 'lawyer up', 'le (epic|meme|reddit\w*|sigh|tired|wrong)s?', 'lea?rn (how )?to (code|math)', 'life.{1,15}finds a way', 'like a b[ao]u?[sw]s', 'literally hitler', 'literally', 'lmf?ao+', 'lost it at', 'lpt', 'm[ae]h', 'm\.? night', 'm\We\Wt\Wa\We\Wt\Wa', 'mad bro', 'magnificent bastard', 'manly tears', 'me too thanks', 'mind ?([:=]=?|equals)? ?blown', 'mom\W*s spaghetti', 'monies', 'nailed it', 'national treasure', 'nice try', 'nope', 'not even once', 'nothing is impossible', 'now kiss', 'ol(\W|d?e?)? reddit', 'ontas', 'op pl[sz]', 'op will ?(surely )?deliver', 'papa.?bless', 'pathetic', 'patrick', 'perfect\w* balance\w*', 'phrasing', 'plot twist', 'pls', 'poovey', 'popcorn', 'por.?qu[eé] no l\ws dos', 'prepare (yo)?ur anus', 'preston garvey', 'real human be(an|ing)', 'real(?=[!.\s]*$)', 'right in the feels', 'risky click', 'said no one ever', 'save?(ing|d)? (for ((the )?future|later|when i)|from (cell|i?phone|mobile))', 'science bitch\w*', 'see what (he|she|they|u|you) did there', 'seems legit', 'sex', 'shia', 'shit\w*', 'shots fired', 'should feel bad', 'show myself out', 'sighs?\W+unzips?', 'slaves?', 'slow claps?', 'sneks?', 'sounds(?!.*\bplan\b)', 'step [0-9]: \?{3}', 'stfu', 'stop', 'stopped reading', 'stupid games?\b.{0,16}\bstupid prizes?', 'stupid', 'su(cks?|x)', 'switch\W?[ae]\W?ro+', 'tagged (yo)?u as', 'take my money', 'tee\W?hee', 'tendies?', 'th(anks?|x)( you| u)?[ ,]*(to )?(the )?(ameri\w*|bush|democrats?|dnc|donald|gop|obama\w*|president|republicans?|trump)', 'thanks?,? [0o]bama', 'that escalated quickly', 'tho', 'tifu', 'tips fedora', 'tl\W*dr', 'to the top with (yo)?u', 'trackers?', 'trigger(ed|ing|s)', 'ur?', 'user.?name', 'vidyas?', 'vpn', 'w[io]n\w* the internet', 'wants the d', 'was( ?n[o\W]?t)? disappoint(ed)?', 'watch the world burn', 'we did it,? reddit', 'weed', 'weirdest boner', 'wh?[au]tf? (did I just read|is this I don\W*t even|happened here)', 'who\W*s cutting onions', 'why we can\W*t have nice things', 'will get buried', 'woah', 'would read again', 'would\S* (not )?bang', 'wtf', 'wut', 'xd', 'yesterday\W{1,3}(yo)?u said tomorrow']
    body#most (regex, full-text): ['[^>]+$']
    body_shorter_than: 50
    ignore_blockquotes: true
    action: remove
    action_reason: "Short and senseless meme [{{match-body#most}}]"
---
Donger Prevention
This rule targets characters used frequently in donger. This rule will also match on some non-English languages. If mathematical, phonetic, or drawing symbols are common on your subreddit, you will need to modify this rule before using it.

Also see Emoji Ban.

This rule is still under development and may be buggy. Use at your own risk.

---
    body+title (regex, includes): ["(?#IPA Extensions)[\u0250-\u02af]", "(?#Combining Diacritical Marks)[\u0300-\u036f]", "(?#Kannada)[\u0c80-\u0cff]", "(?#Thai)[\u0e00-\u0e7f]", "(?#Tibetan)[\u0f00-\u0fff]", "(?#Katakana)[\u30a1-\u30fa]", "(?#Unified Canadian Aboriginal Syllabics)[\u1400-\u167f]", "(?#Phonetic Extensions)[\u1d00-\u1d7f]", "(?#Mathematical Operators)[\u2200-\u22ff]", "(?#Box Drawing)[\u2500-\u257f]", "(?#Halfwidth and Fullwidth Forms)[\uff00-\uff0c\uff0e-\uffef]+"]
    action: filter
    action_reason: "Possible donger [{{match}}]"
---
Title Control
These are all rules about submission titles.

Require Title Tag
Replace the list between the brackets with your own list of required tags. Quotes are required around each individual item due to the use of square brackets.

---
    ~title: ['[Tag1]', '[Tag2]', '[Tag3]']
    action: remove
    action_reason: "Title missing required title tag"
    comment: |
        Your post has been automatically removed because you did not include one of the required title tags.

        Please read the subreddit rules for more information.
---
Reserve Certain Keywords
This rule removes posts with titles that include keywords such as "announcement", "mods", "megathread". It also alerts the moderators that someone may be trying to impersonate them.

This rule can be copy-pasted directly to your AutoModerator configuration without modification. You can customize the list of keywords as needed.

---
    title (regex): ['admin(istrator)?s?', 'announcements?', 'mega\W?(post|thread)s?', 'mod(erator)?(\W?post)?s?']
    action: remove
    action_reason: "Moderator-only title [{{match}}]"
    comment: |
        Your post has been automatically removed because you used a keyword which is reserved for the subreddit moderators.
    modmail: |
        The above post by /u/{{author}}, with title "{{title}}" was removed because it contained a moderator-only keyword.

        Please investigate and make sure that this action was correct.
---
Emoji Ban
These rules removes titles with certain non-standard characters such as emoji, miscellaneous symbols, and dingbats.

---
    # Emoji ban
    title (regex, includes): ["(?#Zero Width Joiner)[\u200d]", "(?#Box Drawing)[\u2500-\u257f]+", "(?#Miscellaneous Symbols)[\u2600-\u26ff]", "(?#Dingbats)[\u2700-\u27ff]", "(?#Braille)[\u2800-\u28ff]", "(?#!Katakana Letter Tu)[\u30c4]", "(?#Various Emoji)[\U0001F000-\U0001FAFF]"]
    action: remove
    action_reason: "Emoji [{{match}}]"
    comment: |
        Your [{{kind}}]({{permalink}} in /r/{{subreddit}}) has been automatically removed because you used an emoji or other symbol.

        Please retry your {{kind}} using text characters only.
---
This rule may be modified to be a title+body rule in order to also apply to the text in self posts and comments.

Some parts may not work well on science, technology, engineering, or mathematical subreddits, especially if applied to body.

User Control
These rules help restrict who can post.

Throwaway Account Prevention
This rule removes all content from accounts created within the last day.

This rule can be copy-pasted directly to your AutoModerator configuration without modification. You can optionally change the required account age; valid units for the age are minutes, hours, days, weeks, months, and years (the word must be plural even if the number given is 1)

---
    author:
        account_age: "< 1 days"
    action: remove
    action_reason: "New user"
---
Troll Prevention
Trolls typically accumulate a fair amount of negative comment karma. This rule removes all content posted by users with less than -50 comment karma.

This rule can be copy-pasted directly to your AutoModerator configuration without modification, although you can optionally customize the karma threshold. Note that comment karma for a user is limited to -100, so no user will match if you put -100 or lower in the rule.

---
    author:
        comment_karma: "< -50"
    action: remove
    action_reason: "Low karma user"
---
User Bot Ban List
Often, it may be advantageous to "bot ban" a troll or spammer rather than ban them. An actual ban simply tells them that it's time to create a new account. With a bot ban, some users won't realize they've been banned. Note that there are two formats, simple and extended. The extended format allows you to keep things clearer and add comments, particularly if you have a lot of users in the list.

Replace the list between the brackets with your own list of users to bot ban.

Simple format:

---
    author:
        name: [username1, username2, username3]
    action: remove
    action_reason: "User is banned"
---
Extended format:

---
    author:
        name:
            # comment for a section of users
            - username1
            - username2 # comment for specific user
            # comment for a section of users
            - username3
    action: remove
    action_reason: "User is banned"
---
User Whitelist
These rules will approve content from specific users. You can use either or both rules.

The first rule auto-approves content at the time a user submits or edits it.

This is the only way to auto-approve content by a user with a site-wide shadowban.
This will also auto-approve some content that contains a site-wide spammed domain (not most submissions using a URL shortener, though).
Note that AutoModerator will never approve content by a shadowbanned user unless the user is specificially mentioned by name or you use a regex check (e.g., name (regex): ['.+']). You also have to uncheck the exclude posts by site-wide banned users from modqueue/unmoderated subreddit setting or AutoModerator will never see the user's content to approve it.
The second rule will auto-approve content by a user when it is reported by another user (or a moderator).

Replace the lists between the brackets with your own list of users to approve.

---
    author:
        name: [username1, username2, username3]
    action: approve
    action_reason: "Whitelisted user"
---
    author:
        name: [username1, username2, username3]
    reports: 1
    action: approve
    action_reason: "Approve reported content from whitelisted user"
---
Moderator Alerts
Alert the subreddit moderators when certain things happen.

Reported Items
Notify the moderators if something recieves a certain number of reports. It is recommended to set the number of required reports to 2 or 3 for smaller subreddits and 3 to 5 for larger ones.

This rule can be copy-pasted directly to your AutoModerator configuration with or without modification.

---
    reports: 2
    action: filter
    action_reason: "Multiple reports"
    modmail: The above {{kind}} by /u/{{author}} has received multiple reports. Please investigate.
---
Topic Alert
Alert the moderators if someone posts about a certain topic.

Replace the list between the brackets with your own list of keywords. Replace topic in the modmail message accordingly.

---
    title: [keyword1, keyword2, keyword3]
    modmail: The above submission by /u/{{author}}, with title "{{title}}" may be about topic.
---
Post Alert
Notify the moderators when a submission is made. This may be useful for small or new subreddits with less activity.

This rule can be copy/pasted directly to your AutoModerator configuration without modification.

---
    type: submission
    modmail: |
        There is a new post in /r/{{subreddit}}!

        - Title: {{title}}
        - User: {{author}}
---
Meta Drama Alert
Alert the moderators that content on their subreddit has been linked to from elsewhere on Reddit.

This rule takes advantage of the existence of /u/TotesMessenger, which detects links to other subreddits and comments to alert users that their content has been linked to from elsewhere on reddit.

This rule requires that /u/TotesMessenger not be banned (or bot banned) from your subreddit.

If you don't want to remove the /u/TotesMessenger comment, remove the top-level action and action_reason lines.

 

---
    author: [TotesMessenger]
    body (regex, includes): ['\[(/r/\w+)\] \[(.+)\]\((https?://\w+\.reddit\.com/\S+)\)']
    action: remove
    action_reason: "Remove {{author}} comment after reporting thread, {{author}} is our friend [{{match-2}}]"
    modmail_subject: "Submission linked from {{match-body-2}}"
    modmail: |
        The following thread in /r/{{subreddit}} has been linked in {{match-body-2}}:

        **Original:** [{{title}}]({{permalink}})

        **Meta post:** [{{match-body-3}}]({{match-body-4}})
---
If you would prefer to be alerted via the moderation queue, use this rule instead:

---
    author: [TotesMessenger]
    body (regex, includes): ['\[(/r/\w+)\] \[(.+)\]\((https?://\w+\.reddit\.com/\S+)\)']
    action: remove
    action_reason: "Remove {{author}} comment after reporting thread, {{author}} is our friend [{{match-2}}]"
    parent_submission:
      action: report
      action_reason: "Submission linked from elsewhere [{{match-body-2}}]"
---
Report Suspicious Content
NSFW and NSFL
---
    title+body (regex): ['not.safe.for.(work|life)', 'nsf[wl]']
    set_nsfw: true
    action: report
    action_reason: "Not safe [{{match}}]"
---
Dox Detection and User Safety
These rules detect possibly unsafe posts including posts that may contain personal information.

For some of the personal information rules, a modmail is sent including a link to report the user to the Reddit admins.

Phone Numbers
This will filter most US and non-US phone numbers. There are exceptions for common mismatches, some jokes and references (e.g., Jenny's number), and a few crisis hotlines.

If there are specific phone numbers that you would like to whitelist, add them to ~body list inside the brackets, within quotes.

---
    title+body (regex, includes): ['(?#INT)(\+(?![\s\(]*\d{4})|\b011)[\(\) ._-]{0,3}(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\b([\(\) ._-]{0,3}\d){5,14}\b', '(?#NA)\(?\b1?\d{3}[\) ._-]{1,3}\d{3}[ ._-]{1,3}\d{4}\b', '(?#UK)\b(?<!\bu/)(?<!\d\.)0(1\d\d(\s*\d){7}|1\d{3}(\s*\d){6}|1\d1(\s*\d){7}|11\d(\s*\d){7}|2\d(\s*\d){8}|169\s*77(\s*\d){4}|1\d{3}(\s*\d){5}|3\d\d(\s*\d){7}|7\d(\s*\d){8}|8\d\d(\s*\d){6,7})\b']
    ~body (regex): ['(0118\W+999\W+8[18]1|999\W+119\W+7253)', '(?<=\$)\d+(\.\d\d)?[^\w,.]*[+-][^\w,.]*\d+', '(https?://|www\.)\S*([\(\)._-]{0,3}\d){5}\w*', '000.000.0000', '1024\W+2048', '111.111.1111', '222.222.2222', '281\W+330.8004', '505\W+503.4455', '678.999.8212', '800\W+273.8255', '800\W+799.7233', '999.999.9999', '\d*1\W?2\W?3\W?4\W?5\W?6\W?7\W?8\W?9\d*', '\d{3}\W+555\W\d{4}', '\d{3}\W+867.5309', '\w*\d[\)\s]*=\W*\d\w*']
    author:
      is_contributor: false
    action: filter
    action_reason: "Phone number detected [{{match}}]"
---
Email Addresses
Replace the list on the ~title+body#whitelist line with any email addresses you need to whitelist. You should only whitelist email addresses that Reddit does not consider personal information. If you have no whitelisted email addresses, remove the ~title+body#whitelist line.

---
    title+body (regex): ['(?!(abuse|help|info|no-?reply|phishing|service|spoof|support)\@)[\w!#$%&\x27*+\-./=?\^\x60{|}~]+\@([\w-]{1,64}\.)+([a-z]{2,16}|xn--[a-z0-9-]{1,60})']
    ~title+body#whitelist: [okay.address1@example.com, okay.address2@example.com]
    action: remove
    action_reason: "Email address detected [{{match}}]"
    modmail_subject: Doxxing Alert!
    modmail: |
        {{permalink}}

        The above {{kind}} by /u/{{author}} was removed because it contained a possible email address. Please investigate immediately.

        If the user is doxxing, [ban them](/r/{{subreddit}}/about/banned) and [report them to the Reddit admins](http://www.reddit.com/message/compose?to=%2Fr%2Freddit.com&subject=Doxxing%20Report:%20%2Fu%2F{{author}}) immediately.
---
Credit Card Numbers
Credit goes to /u/sexrockandroll and /u/Deimorz for the regex.

---
    title+body (regex): ['\b(?:4[0-9]{12}(?:[0-9]{3})?|5[12345][0-9]{14}|3[47][0-9]{13}|3(?:0[012345]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35[0-9]{3})[0-9]{11})\b']
    action: remove
    action_reason: "Credit card number detected [{{match}}]"
    modmail_subject: Doxxing Alert!
    modmail: |
        {{permalink}}

        The above {{kind}} by /u/{{author}} was removed because it contained a possible credit card number. Please investigate immediately.

        If the user is doxxing, [ban them](/r/{{subreddit}}/about/banned) and [report them to the Reddit admins](http://www.reddit.com/message/compose?to=%2Fr%2Freddit.com&subject=Doxxing%20Report:%20%2Fu%2F{{author}}) immediately.
---
IPv4 Addresses
---
    title+body (regex): ['\b(?!(?#RANGES)(10\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|192\.168\.)|(?#SINGLES)(1\.0\.0\.1|1\.1\.1\.1|1\.2\.3\.4|8\.8\.4\.4|8\.8\.8\.8|9\.9\.9\.9|127\.0\.0\.1|149\.112\.112\.112|208\.67\.220\.220|208\.67\.222\.222)\b)((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)\b']
    action: remove
    action_reason: "IPv4 address detected [{{match}}]"
    modmail_subject: Doxxing Alert!
    modmail: |
        {{permalink}}

        The above {{kind}} by /u/{{author}} was removed because it contained a possible IPv4 address. Please investigate immediately.

        If the user is doxxing, [ban them](/r/{{subreddit}}/about/banned) and [report them to the Reddit admins](http://www.reddit.com/message/compose?to=%2Fr%2Freddit.com&subject=Doxxing%20Report:%20%2Fu%2F{{author}}) immediately.
---
Street Addresses
Catches US-style street addresses. Does not catch P.O. boxes.

This rule is not recommended for subreddits dedicated to particular areas (like cities) where street addresses for businesses are likely to be common.

Add whitelisted addresses to the list on the ~title+body#whitelist line, inside the brackets with each item in single quotes and separated by commas.

This rule is still under development and may be buggy. Use at your own risk.

---
    title+body (regex): ['\W[A-Za-z]?\d{1,6}[A-Za-z]? (E(\.|ast)?|W(\.|est)?|N(\.|orth)?|S(\.|outh)? )?[\p{Pi}\p{Pf}]?\w+( \w+)?[\p{Pi}\p{Pf}]? (st(reet)?|ave(enue)?|r(oa)?d|dr(ive)?|c(our)?t|blvd|boulevard|lane|ln|highway|hwy|route|rt)']
    ~title+body#whitelist (regex): ['(123 main|221b baker) st(reet)?', '(day|dis[ck]|flash|floppy|gb|gen\W?\d+|hour|inch|kilometer|km|mile|minute|nvme|rpm|sata|second|ssd|tb|week|wheel)s? (\w+ )?drive']
    action: remove
    action_reason: "Street address detected [{{match}}]"
    modmail_subject: Doxxing Alert!
    modmail: |
        {{permalink}}

        The above {{kind}} by /u/{{author}} was removed because it contained a possible street address. Please investigate immediately.

        If the user is doxxing, [ban them](/r/{{subreddit}}/about/banned) and [report them to the Reddit admins](http://www.reddit.com/message/compose?to=%2Fr%2Freddit.com&subject=Doxxing%20Report:%20%2Fu%2F{{author}}) immediately.
---
Disguised Links
Detect and filter content where Reddit markup is used to disguise one link as another.

This rule can be copy-pasted into your AutoModerator config without modification.
The regex used in body+title must be the first regex in the line or it will not work.
The regex is written for AutoModerator and will require backreference numbering changes to work elsewhere.
 

---
    body+title (regex, includes): ['\[\s*(?:https?://)?(([\w-]{1,64}\.)+[a-z][\w-]{1,63}(?=[\s#&/?\]]))[^\]]*\]\x28\s*https?://(?!((en|home|np|www)\.)?\2[\s#&\x29/?]|[\w.-]+\.gov/|www\.google\.com/url\?\S*\2)[^\x29]*\x29']
    action: filter
    action_reason: "Possible disguised link, please review [{{match}}]"
---
Username Mentions
Detect and remove comments containing username mention "pings".

This rule can be copy-pasted into your AutoModerator config without modification.
Reddit only sends a notification for comments containing 3 or fewer usernames so the ~body line exempts comments with more than 3 unique usernames.
The regex used in ~body must be the first regex in the line or it will not work.
 

---
    type: comment
    body (regex, includes): ['(?<!\bhttps://\w{3}\.reddit\.com/)\bu/([\w-]{3,20})']
    ~body (regex, includes): ['(?<!\bhttps://\w{3}\.reddit\.com/)\bu/([\w-]{3,20}).*(?<!\bhttps://\w{3}\.reddit\.com/)\bu/(?!\2)([\w-]{3,20}).*(?<!\bhttps://\w{3}\.reddit\.com/)\bu/(?!\2|\3)([\w-]{3,20}).*(?<!\bhttps://\w{3}\.reddit\.com/)\bu/(?!\2|\3|\4)[\w-]{3,20}']
    action: remove
    action_reason: "Remove username mention [{{match-2}}]"
---
Flair
These rules are related to flair.

Set Default Flair for New Users
Detects users with no flair and assigns a default flair.

Replace user text is here with your desired text for the flair and replace userclassishere with the name of your default flair class. Both items stay within quotes.

---
    author:
        ~flair_css_class (regex): ['.+']
        set_flair: ["user text is here", "userclassishere"]
---
Flair Ban
If a user keeps setting inappropriate flair, use this rule to "flair ban" them.

Replace the list between the brackets in the "name" line with your list of users to flair-ban.

Note: this rule will clear their flair every time they participate in the subreddit. It will not prevent them from changing their flair again afterwards (Reddit does not provide any way to do that). This only makes it annoying and time-consuming for the user to maintain an inappropriate flair.

(Originally, this was also possible with an empty css_class in the second field of set_flair, but that doesn't work anymore.)

---
    author:
        name: [username1, username2, username3]
        flair_text (regex): ['.+']
        set_flair: ["", "_"]
        overwrite_flair: true
---
Domain-based Link Flair
Set automatic link flair on certain domains. It is highly recommended that the flair class used not appear as a link flair template, so that users cannot use it to mislead other redditors.

Replace link text is here with your desired text for the flair and replace linkclassishere with the name of your default flair class. Both items stay within quotes. Replace the list within brackets with your own list of domains to receive automatic link flair.

---
    domain: [site1.com, site2.com, site3.com]
    set_flair: ["link text is here", "linkclassishere"]
---
Keyword-based Link Flair
Assign link flair based on keywords in post title.

Replace link text is here with your desired text for the flair and replace linkclassishere with the name of your default flair class. Both items stay within quotes. Replace the list within brackets with your own list of keywords to receive automatic link flair.

---
    title: [keyword1, keyword2, keyword3]
    set_flair: ["link text is here", "linkclassishere"]
---
Default Link Flair
Set a default link flair on all link submissions.

The use of priority: -1 ensures that this rule is evaluated last (after any other rule that might assign a different link flair).

Replace link text is here with your desired text for the flair and replace linkclassishere with the name of your default flair class. Both items stay within quotes.

---
    type: link submission
    priority: -1
    set_flair: ["link text is here", "linkclassishere"]
---