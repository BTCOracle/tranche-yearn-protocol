#!/bin/bash

# Fake History Generator Script (Random Interval 1-5 Days + Random Time)
# Creates commits from start_date to end_date with random intervals

# Hardcoded date range
START_DATE="2015-10-12"
END_DATE="2025-10-12"

# Validate date format
if ! date -d "$START_DATE" >/dev/null 2>&1; then
    echo "Error: Invalid start date format. Use YYYY-MM-DD"
    exit 1
fi

if ! date -d "$END_DATE" >/dev/null 2>&1; then
    echo "Error: Invalid end date format. Use YYYY-MM-DD"
    exit 1
fi

# Check if start_date is before end_date
if [ "$(date -d "$START_DATE" +%s)" -ge "$(date -d "$END_DATE" +%s)" ]; then
    echo "Error: Start date must be before end date"
    exit 1
fi

echo "Creating fake history from $START_DATE to $END_DATE"

# Check if required files exist
if [ ! -f "src/components/style.css" ]; then
    echo "Error: src/components/style.css file not found!"
    exit 1
fi

if [ ! -f "src/components/stylenav.css" ]; then
    echo "Creating empty src/components/stylenav.css file..."
    touch src/components/stylenav.css
fi

# Get the total number of lines in the real file
total_lines=$(wc -l < "src/components/style.css")
echo "Total lines in src/components/style.css: $total_lines"

# Read the real file into an array
mapfile -t lines < "src/components/style.css"

# Initialize the empty file
> "src/components/stylenav.css"

# Calculate total days between start and end date
total_days_span=$(( ($(date -d "$END_DATE" +%s) - $(date -d "$START_DATE" +%s)) / 86400 ))
echo "Total days span: $total_days_span days"

# Track current line position and current date
current_line=0
current_date="$START_DATE"
commit_num=0

# Loop until all lines are processed
while [ $current_line -lt $total_lines ]; do
    # Check if we've exceeded the end date
    if [ "$(date -d "$current_date" +%s)" -gt "$(date -d "$END_DATE" +%s)" ]; then
        echo "Warning: Reached end date before processing all lines"
        break
    fi
    
    # Generate random interval (1-5 days)
    random_interval=$((1 + RANDOM % 5))
    
    # Generate random hour (9 AM to 8 PM - working hours)
    random_hour=$((9 + RANDOM % 12))
    
    # Generate random minute (0-59)
    random_minute=$((RANDOM % 60))
    
    # Use current date for this commit
    commit_date=$(date -d "$current_date $random_hour:$random_minute:00" "+%Y-%m-%d %H:%M:%S")
    
    # Generate random number of lines to add (1-5, but don't exceed total)
    max_possible=$((total_lines - current_line))
    lines_to_add=$((1 + RANDOM % 5))
    
    # Ensure we don't add more lines than available
    if [ $lines_to_add -gt $max_possible ]; then
        lines_to_add=$max_possible
    fi
    
    # Add the lines to the file
    for ((i=0; i<$lines_to_add; i++)); do
        if [ $current_line -lt $total_lines ]; then
            echo "${lines[$current_line]}" >> "src/components/stylenav.css"
            ((current_line++))
        fi
    done
    
    # Git operations with specific date
    git add src/components/stylenav.css
    GIT_AUTHOR_DATE="$commit_date" GIT_COMMITTER_DATE="$commit_date" git commit -m "src/components/stylenav.css update - added $lines_to_add lines"
    
    # Advance current date by random interval
    current_date=$(date -d "$current_date + $random_interval days" "+%Y-%m-%d")
    
    # Show progress
    ((commit_num++))
    echo "Commit $commit_num: Added $lines_to_add lines (total: $current_line/$total_lines)"
    echo "  Date: $(date -d "$commit_date" "+%Y-%m-%d %H:%M")"
    echo "  Interval: $random_interval days, Time: ${random_hour}:${random_minute}"
    echo "  Next date: $current_date"
    echo "----------------------------------------"
    
    # Small delay to ensure unique timestamps
    sleep 1
done
git push origin main
echo "Fake history generation complete!"
echo "Total commits created: $commit_num"
echo "Total lines added: $current_line/$total_lines"
echo "Date range: $START_DATE to $END_DATE"

# Show summary statistics
echo ""
echo "=== SUMMARY ==="
echo "Average lines per commit: $(echo "scale=2; $total_lines / $commit_num" | bc)"
echo "Total time span: $total_days_span days"
echo "Average days between commits: $(echo "scale=2; $total_days_span / $commit_num" | bc)"

# Final push reminder
echo ""
echo "Run 'git push origin main' to push the history to remote repository"
echo "Commits created from: $START_DATE to $END_DATE"