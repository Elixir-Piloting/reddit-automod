import * as vscode from 'vscode';

export class AutoModeratorScaffoldProvider {
    async createScaffold() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        // Show quick pick to select scaffold type
        const scaffoldType = await vscode.window.showQuickPick([
            { label: 'Complete Subreddit Moderation', description: 'Full moderation setup for any subreddit' },
            { label: 'Basic Rule', description: 'A simple AutoModerator rule template' },
            { label: 'Domain Blacklist', description: 'Rule to block specific domains' },
            { label: 'User Karma Check', description: 'Rule to check user karma/age' },
            { label: 'Content Filter', description: 'Rule to filter content based on keywords' },
            { label: 'Flair Assignment', description: 'Rule to automatically assign flair' },
            { label: 'Report Handler', description: 'Rule to handle reported content' },
            { label: 'Comment Moderation', description: 'Rule for comment-specific moderation' },
            { label: 'Complete Config', description: 'Full AutoModerator configuration with multiple rules' }
        ], {
            placeHolder: 'Select a scaffold type'
        });

        if (!scaffoldType) return;

        const scaffold = this.getScaffold(scaffoldType.label);
        if (scaffold) {
            await editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, scaffold);
            });
            
            vscode.window.showInformationMessage(`Created ${scaffoldType.label} scaffold`);
        }
    }

    private getScaffold(type: string): string {
        switch (type) {
            case 'Complete Subreddit Moderation':
                return this.getCompleteSubredditModerationScaffold();
            case 'Basic Rule':
                return this.getBasicRuleScaffold();
            case 'Domain Blacklist':
                return this.getDomainBlacklistScaffold();
            case 'User Karma Check':
                return this.getUserKarmaCheckScaffold();
            case 'Content Filter':
                return this.getContentFilterScaffold();
            case 'Flair Assignment':
                return this.getFlairAssignmentScaffold();
            case 'Report Handler':
                return this.getReportHandlerScaffold();
            case 'Comment Moderation':
                return this.getCommentModerationScaffold();
            case 'Complete Config':
                return this.getCompleteConfigScaffold();
            default:
                return this.getBasicRuleScaffold();
        }
    }

    private getBasicRuleScaffold(): string {
        return `---
# Basic AutoModerator Rule
# Add your rule description here

# Rule conditions
title: ["keyword1", "keyword2"]
body: ["spam phrase", "offensive word"]

# Action to take
action: remove
action_reason: "Violates community guidelines"

# Optional: Add a comment explaining the removal
comment: |
    Your {{kind}} was removed because it violates our community guidelines.
    Please review the rules before posting again.

# Optional: Send a message to the author
message: |
    Your {{kind}} in /r/{{subreddit}} was removed for violating our community guidelines.
    Please review the rules before posting again.

# Optional: Notify moderators
modmail: |
    The above {{kind}} by /u/{{author}} was automatically removed.
    Please review if this action was correct.
---
`;
    }

    private getDomainBlacklistScaffold(): string {
        return `---
# Domain Blacklist Rule
# Remove submissions from specific domains

# Block specific domains
domain: ["spam.com", "malware.com", "phishing.com"]
action: spam
action_reason: "Spam domain [{{match}}]"

# Optional: Also check title and body for these domains
domain+body+title: ["badwebsite.com", "scam.com"]
action: filter
action_reason: "Suspicious domain [{{match}}]"

# Optional: Send modmail for review
modmail: |
    A submission from a blacklisted domain was removed:
    - Domain: {{domain}}
    - Author: /u/{{author}}
    - Title: {{title}}
---
`;
    }

    private getUserKarmaCheckScaffold(): string {
        return `---
# User Karma Check Rule
# Filter content from users with low karma or new accounts

# Check user karma and account age
author:
    comment_karma: "< 10"
    post_karma: "< 5"
    account_age: "< 7 days"
action: filter
action_reason: "New user with low karma"

# Optional: Different action for very new accounts
author:
    account_age: "< 1 days"
action: remove
action_reason: "Brand new account"

# Optional: Approve content from trusted users
author:
    comment_karma: "> 1000"
    post_karma: "> 100"
    account_age: "> 30 days"
action: approve
action_reason: "Trusted user"
---
`;
    }

    private getContentFilterScaffold(): string {
        return `---
# Content Filter Rule
# Filter content based on keywords or patterns

# Filter offensive language
title+body (regex): ["badword1", "badword2", "offensive.*phrase"]
action: filter
action_reason: "Inappropriate content"

# Filter spam patterns
body (regex): ["buy.*now", "click.*here", "limited.*time"]
action: filter
action_reason: "Possible spam"

# Filter short/low-effort content
body_shorter_than: 10
is_top_level: true
action: remove
action_reason: "Low-effort comment"

# Optional: Use standard conditions
standard: image hosting sites
action: approve
action_reason: "Approved image host"
---
`;
    }

    private getFlairAssignmentScaffold(): string {
        return `---
# Flair Assignment Rule
# Automatically assign flair based on content

# Assign flair based on keywords in title
title: ["discussion", "question", "help"]
set_flair: ["Discussion", "discussion"]

# Assign flair based on domain
domain: ["youtube.com", "vimeo.com"]
set_flair: ["Video", "video"]

# Assign flair based on content type
type: text submission
set_flair: ["Text Post", "text"]

# Optional: Set user flair for trusted contributors
author:
    comment_karma: "> 500"
    set_flair: ["Trusted User", "trusted"]

# Optional: Overwrite existing flair
overwrite_flair: true
---
`;
    }

    private getReportHandlerScaffold(): string {
        return `---
# Report Handler Rule
# Handle content that receives multiple reports

# Filter content with multiple reports
reports: 2
action: filter
action_reason: "Multiple reports"
modmail: |
    The above {{kind}} by /u/{{author}} has received multiple reports.
    Please investigate.

# Different action for more reports
reports: 5
action: remove
action_reason: "Heavily reported content"
modmail: |
    The above {{kind}} by /u/{{author}} has received 5+ reports.
    Immediate attention required.

# Optional: Auto-approve reported content from trusted users
author:
    comment_karma: "> 1000"
reports: 1
action: approve
action_reason: "Approve reported content from trusted user"
---
`;
    }

    private getCommentModerationScaffold(): string {
        return `---
# Comment Moderation Rule
# Moderate comments specifically

type: comment

# Remove short/low-effort comments
body_shorter_than: 10
is_top_level: true
action: remove
action_reason: "Low-effort comment"

# Filter offensive comments
body (regex): ["offensive.*word", "hate.*speech"]
action: filter
action_reason: "Inappropriate comment"

# Remove username mentions (pings)
body (regex): ["\\bu/\\w+"]
action: remove
action_reason: "Username mention not allowed"

# Optional: Lock comments on controversial posts
parent_submission:
    reports: 3
set_locked: true
modmail: |
    Comments locked on controversial submission:
    - Title: {{title}}
    - Author: /u/{{author}}
---
`;
    }

    private getCompleteConfigScaffold(): string {
        return `---
# Complete AutoModerator Configuration
# This is a comprehensive setup with multiple rules

# ========================================
# 1. New User Protection
# ========================================
---
# Filter content from new users with low karma
author:
    comment_karma: "< 10"
    post_karma: "< 5"
    account_age: "< 7 days"
action: filter
action_reason: "New user with low karma"
modmail: |
    New user content filtered for review:
    - Author: /u/{{author}}
    - Karma: {{author_comment_karma}} comment, {{author_post_karma}} post
    - Account age: {{author_account_age}}

# ========================================
# 2. Domain Management
# ========================================
---
# Block spam domains
domain: ["spam.com", "malware.com", "phishing.com"]
action: spam
action_reason: "Spam domain [{{match}}]"

# Approve trusted domains
domain: ["youtube.com", "imgur.com", "reddit.com"]
action: approve
action_reason: "Trusted domain [{{match}}]"

# ========================================
# 3. Content Quality Control
# ========================================
---
# Remove very short comments
type: comment
body_shorter_than: 10
is_top_level: true
action: remove
action_reason: "Low-effort comment"

# Filter offensive content
title+body (regex): ["offensive.*word", "hate.*speech"]
action: filter
action_reason: "Inappropriate content"

# ========================================
# 4. Report Handling
# ========================================
---
# Handle reported content
reports: 2
action: filter
action_reason: "Multiple reports"
modmail: |
    Content with multiple reports:
    - Author: /u/{{author}}
    - Reports: {{reports}}
    - Link: {{permalink}}

# ========================================
# 5. Flair Assignment
# ========================================
---
# Auto-assign flair based on content
title: ["discussion", "question", "help"]
set_flair: ["Discussion", "discussion"]

domain: ["youtube.com", "vimeo.com"]
set_flair: ["Video", "video"]

# ========================================
# 6. Trusted User Benefits
# ========================================
---
# Auto-approve content from trusted users
author:
    comment_karma: "> 1000"
    post_karma: "> 100"
    account_age: "> 30 days"
action: approve
action_reason: "Trusted user"

# ========================================
# 7. Emergency Rules
# ========================================
---
# Emergency content removal
title+body (regex): ["emergency.*keyword", "urgent.*removal"]
action: remove
action_reason: "Emergency removal"
modmail: |
    EMERGENCY: Content automatically removed
    - Author: /u/{{author}}
    - Content: {{title}}
    - Link: {{permalink}}
---
`;
    }

    private getCompleteSubredditModerationScaffold(): string {
        return `---
# Complete Subreddit Moderation Setup
# Professional AutoModerator configuration for any subreddit
# This template provides comprehensive moderation for communities of any size

# ========================================
# 1. NEW USER PROTECTION & SPAM PREVENTION
# ========================================
---
# Filter brand new accounts (prevents spam bots)
author:
    account_age: "< 1 days"
action: filter
action_reason: "Brand new account"
modmail: |
    New account content filtered:
    - Author: /u/{{author}}
    - Account age: {{author_account_age}}

---
# Filter low karma users (adjust thresholds as needed)
author:
    comment_karma: "< 10"
    post_karma: "< 5"
    account_age: "< 7 days"
action: filter
action_reason: "Low karma new user"
modmail: |
    Low karma user content filtered:
    - Author: /u/{{author}}
    - Comment karma: {{author_comment_karma}}
    - Post karma: {{author_post_karma}}
    - Account age: {{author_account_age}}

# ========================================
# 2. DOMAIN & LINK MANAGEMENT
# ========================================
---
# Block common spam domains
domain: ["spam.com", "malware.com", "phishing.com", "scam.com", "fake.com"]
action: spam
action_reason: "Spam domain [{{match}}]"

---
# Block URL shorteners (prevents spam)
domain: ["bit.ly", "goo.gl", "tinyurl.com", "t.co", "is.gd"]
action: remove
action_reason: "URL shortener not allowed"
comment: |
    Your submission was removed because URL shorteners are not allowed.
    Please use direct links instead.

---
# Approve trusted domains
domain: ["youtube.com", "youtu.be", "imgur.com", "reddit.com", "redd.it", "github.com", "stackoverflow.com"]
action: approve
action_reason: "Trusted domain [{{match}}]"

---
# Use standard conditions for image/video hosting
standard: image hosting sites
action: approve
action_reason: "Approved image host"

standard: video hosting sites
action: approve
action_reason: "Approved video host"

# ========================================
# 3. CONTENT QUALITY CONTROL
# ========================================
---
# Remove very short/low-effort comments
type: comment
body_shorter_than: 10
is_top_level: true
action: remove
action_reason: "Low-effort comment"

---
# Filter offensive language and hate speech
title+body (regex): ["offensive.*word", "hate.*speech", "slur", "bigot"]
action: filter
action_reason: "Inappropriate content"
modmail: |
    Potentially inappropriate content filtered:
    - Author: /u/{{author}}
    - Content: {{title}} {{body}}

---
# Filter spam patterns
body (regex): ["buy.*now", "click.*here", "limited.*time", "act.*now", "don't.*miss"]
action: filter
action_reason: "Possible spam"
modmail: |
    Possible spam detected:
    - Author: /u/{{author}}
    - Content: {{body}}

---
# Remove username mentions (pings)
type: comment
body (regex): ["\\\\bu/\\\\w+"]
action: remove
action_reason: "Username mention not allowed"
comment: |
    Username mentions are not allowed in this subreddit.
    Please edit your comment to remove the mention.

# ========================================
# 4. REPORT HANDLING & MODERATION
# ========================================
---
# Handle reported content (adjust threshold based on subreddit size)
reports: 2
action: filter
action_reason: "Multiple reports"
modmail: |
    Content with multiple reports:
    - Author: /u/{{author}}
    - Reports: {{reports}}
    - Link: {{permalink}}
    - Title: {{title}}

---
# Emergency removal for heavily reported content
reports: 5
action: remove
action_reason: "Heavily reported content"
modmail: |
    EMERGENCY: Heavily reported content removed
    - Author: /u/{{author}}
    - Reports: {{reports}}
    - Link: {{permalink}}
    - Title: {{title}}

---
# Lock comments on controversial posts
parent_submission:
    reports: 3
set_locked: true
modmail: |
    Comments locked on controversial submission:
    - Title: {{title}}
    - Author: /u/{{author}}
    - Reports: {{reports}}

# ========================================
# 5. FLAIR & ORGANIZATION
# ========================================
---
# Auto-assign flair based on content type
title: ["discussion", "question", "help", "advice"]
set_flair: ["Discussion", "discussion"]

---
# Flair for different content types
domain: ["youtube.com", "youtu.be", "vimeo.com"]
set_flair: ["Video", "video"]

type: text submission
set_flair: ["Text Post", "text"]

---
# Set user flair for trusted contributors
author:
    comment_karma: "> 500"
    post_karma: "> 50"
    account_age: "> 30 days"
    set_flair: ["Trusted User", "trusted"]

# ========================================
# 6. TRUSTED USER BENEFITS
# ========================================
---
# Auto-approve content from trusted users
author:
    comment_karma: "> 1000"
    post_karma: "> 100"
    account_age: "> 60 days"
action: approve
action_reason: "Trusted user"

---
# Approve reported content from trusted users
author:
    comment_karma: "> 500"
reports: 1
action: approve
action_reason: "Approve reported content from trusted user"

# ========================================
# 7. EMERGENCY & SAFETY RULES
# ========================================
---
# Emergency content removal
title+body (regex): ["emergency.*keyword", "urgent.*removal", "danger.*alert"]
action: remove
action_reason: "Emergency removal"
modmail: |
    EMERGENCY: Content automatically removed
    - Author: /u/{{author}}
    - Content: {{title}} {{body}}
    - Link: {{permalink}}

---
# Filter potential doxxing
title+body (regex): ["phone.*number", "address", "email.*address"]
action: filter
action_reason: "Potential personal information"
modmail: |
    Potential personal information detected:
    - Author: /u/{{author}}
    - Content: {{title}} {{body}}

---
# Filter crowdfunding and donation requests
standard: crowdfunding sites
action: filter
action_reason: "Crowdfunding link"
modmail: |
    Crowdfunding link filtered:
    - Author: /u/{{author}}
    - Domain: {{domain}}

# ========================================
# 8. SUBREDDIT-SPECIFIC RULES
# ========================================
---
# Example: Filter off-topic content (customize for your subreddit)
title+body (regex): ["off.*topic", "unrelated", "wrong.*sub"]
action: filter
action_reason: "Off-topic content"
comment: |
    This content appears to be off-topic for this subreddit.
    Please ensure your posts are relevant to the community.

---
# Example: Filter duplicate content
title (regex): ["repost", "duplicate", "already.*posted"]
action: filter
action_reason: "Possible duplicate"
modmail: |
    Possible duplicate content:
    - Author: /u/{{author}}
    - Title: {{title}}

# ========================================
# 9. MODERATOR NOTIFICATIONS
# ========================================
---
# Notify moderators of new submissions (for small subreddits)
type: submission
modmail: |
    New submission in /r/{{subreddit}}:
    - Title: {{title}}
    - Author: /u/{{author}}
    - Type: {{kind}}

---
# Notify of potential issues
title+body (regex): ["mod.*help", "moderator.*attention", "admin.*help"]
modmail: |
    User requesting moderator attention:
    - Author: /u/{{author}}
    - Content: {{title}} {{body}}

# ========================================
# 10. MAINTENANCE & CLEANUP
# ========================================
---
# Remove old posts that violate current rules
is_edited: true
title+body (regex): ["old.*rule", "outdated.*content"]
action: remove
action_reason: "Outdated content"

---
# Filter content from banned users (if they create new accounts)
author:
    name: ["banned_user1", "banned_user2"]
action: remove
action_reason: "Banned user"

# ========================================
# CONFIGURATION NOTES
# ========================================
# 
# 1. Adjust karma thresholds based on your subreddit size:
#    - Small subreddits: Lower thresholds (5-10 karma)
#    - Large subreddits: Higher thresholds (50-100 karma)
#
# 2. Customize domain lists for your subreddit's needs
#
# 3. Add subreddit-specific keywords to the content filters
#
# 4. Modify flair text and CSS classes to match your subreddit
#
# 5. Adjust report thresholds based on community size
#
# 6. Test rules in a private subreddit first
---
`;
    }
} 