from django.db import connection
from django.utils import timezone

def start(student_id,from_date,words=None,achievement_ids=None):

    wheres = [
        "learning_progress.student_id=%s",
        "at < %s"
    ]

    values = [
        student_id,
        from_date
    ]

    if words is not None:
        wheres.append("word IN (%s)" % ','.join(['%s' for word in words]))
        values.extend(words)

    if words is not None:
        wheres.append("achievement_id IN (%s)" % ','.join(['%s' for achievement_id in achievement_ids]))
        values.extend(achievement_ids)

    query = """
        SELECT
            learning_progress.achievement_id,
            learning_progress.word
        FROM
            learning_progress,
            (
                SELECT
                    student_id,
                    achievement_id,
                    word,
                    MAX(at) AS at
                FROM 
                    learning_progress
                WHERE
                    %s
                GROUP BY
                    achievement_id,
                    word
            ) AS latest
        WHERE
            learning_progress.student_id=latest.student_id AND
            learning_progress.achievement_id=latest.achievement_id AND
            learning_progress.word=latest.word AND
            learning_progress.at=latest.at AND
            learning_progress.hold=1
    """ % " AND ".join(wheres)

    start = {}
    cursor = connection.cursor()
    cursor.execute(query, values)
    row = cursor.fetchone()
    while row is not None:
        start.setdefault(row[0],{})
        start[row[0]][row[1]] = 1
        row = cursor.fetchone()

    return start


def finish(student_id,to_date,words=None,achievement_ids=None):

    pass 
