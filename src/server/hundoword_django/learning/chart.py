import datetime
import pytz

from django.db import connection
from django.utils import timezone

def start(student_id,words,achievement_ids,from_date):

    wheres = [
        "learning_progress.student_id=%s",
        "at < %s"
    ]

    values = [
        student_id,
        from_date
    ]

    wheres.append("word IN (%s)" % ','.join(['%s' for word in words]))
    values.extend(words)

    wheres.append("achievement_id IN (%s)" % ','.join(['%s' for achievement_id in achievement_ids]))
    values.extend(achievement_ids)

    query = """
        SELECT
            learning_progress.achievement_id,
            learning_progress.word,
            learning_progress.held
        FROM
            learning_progress,
            (
                SELECT
                    student_id,
                    achievement_id,
                    word,
                    MAX(at) AS last
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
            learning_progress.at=latest.last
    """ % " AND ".join(wheres)

    start = {}
    cursor = connection.cursor()
    cursor.execute(query, values)
    row = cursor.fetchone()
    while row is not None:
        start.setdefault(row[0],{})
        start[row[0]][row[1]] = row[2]
        row = cursor.fetchone()

    return start


def finish(student_id,by,words,achievement_ids,from_date=None,to_date=None):

    if by == "month":
        sql = "DATE_FORMAT(at,'%%Y-%%m')"
    elif by == "week":
        sql = "DATE_FORMAT(DATE_SUB(at,INTERVAL WEEKDAY(at) DAY),'%%Y-%%m-%%d')"
    else:
        sql = "DATE_FORMAT(at,'%%Y-%%m-%%d')"

    wheres = [
        "learning_progress.student_id=%s"
    ]

    values = [
        student_id
    ]

    wheres.append("word IN (%s)" % ','.join(['%s' for word in words]))
    values.extend(words)

    wheres.append("achievement_id IN (%s)" % ','.join(['%s' for achievement_id in achievement_ids]))
    values.extend(achievement_ids)

    if from_date is not None:
        wheres.append("at >= %s")
        values.append(from_date)

    if to_date is not None:
        wheres.append("at < %s")
        values.append(to_date)

    query = """
        SELECT
            %s AS `when`,
            learning_progress.achievement_id,
            learning_progress.word,
            learning_progress.held,
            learning_progress.at
        FROM
            learning_progress,
            (
                SELECT
                    student_id,
                    achievement_id,
                    word,
                    MAX(at) AS last
                FROM 
                    learning_progress
                WHERE
                    %s
                GROUP BY
                    achievement_id,
                    word,
                    %s
            ) AS latest
        WHERE
            learning_progress.student_id=latest.student_id AND
            learning_progress.achievement_id=latest.achievement_id AND
            learning_progress.word=latest.word AND
            learning_progress.at=latest.last
        ORDER BY
            learning_progress.at
    """ % (sql," AND ".join(wheres),sql)

    begin = None
    end = None
    finish = {}
    cursor = connection.cursor()
    cursor.execute(query, values)
    row = cursor.fetchone()
    while row is not None:

        finish.setdefault(row[0],{})
        finish[row[0]].setdefault(row[1],{})
        finish[row[0]][row[1]][row[2]] = row[3]

        if begin is None or row[4] < begin:
            begin = row[4]

        if end is None or row[4] > end:
            end = row[4]

        row = cursor.fetchone()

    return (finish,begin,end)


def build(student_id,by,words,achievement_ids,from_date=None,to_date=None):

    if by == "month":
        format = "%Y-%m"
        delta = {"days": 31}
    elif by == "week":
        format = "%Y-%m-%d"
        delta = {"weeks": 1}
    else:
        format = "%Y-%m-%d"
        delta = {"days": 1}

    first = {}
    for achievement_id in achievement_ids:
        first.setdefault(achievement_id,{})
        for word in words:
            first[achievement_id][word] = 0

    if from_date is not None:
        start_data = start(student_id,words,achievement_ids,from_date)
        for achievement_id in start_data:
            for word in start_data[achievement_id]:
                first[achievement_id][word] = start_data[achievement_id][word]

    (finish_data,begin,end) = finish(student_id,by,words,achievement_ids,from_date,to_date)

    if from_date is not None:
        start_date = pytz.utc.localize(datetime.datetime.strptime(from_date.strftime(format),format))
    else:
        start_date = pytz.utc.localize(datetime.datetime.strptime(begin.strftime(format),format))

    if to_date is not None:
        finish_date = pytz.utc.localize(datetime.datetime.strptime(to_date.strftime(format),format))
    else:
        finish_date = pytz.utc.localize(datetime.datetime.strptime(end.strftime(format),format))+datetime.timedelta(**delta)

    if by == "week":
        start_date -= datetime.timedelta(days=start_date.weekday())
        finish_date -= datetime.timedelta(days=finish_date.weekday())
    elif by == "month":
        finish_date.replace(day=1)

    data = []
    for index, achievement_id in enumerate(achievement_ids):
        data.append({
            "achievement_id": achievement_id,
            "totals": []
        })

    times = []
    current_date = start_date
    while current_date < finish_date:

        current = current_date.strftime(format)

        totals = {}
        times.append(current)

        if current in finish_data:
            for achievement_id in finish_data[current]:
                for word in finish_data[current][achievement_id]:
                    first[achievement_id][word] = finish_data[current][achievement_id][word]

        for achievement_id in first:
            totals[achievement_id] = 0
            for word in first[achievement_id]:
                totals[achievement_id] += first[achievement_id][word]

        for index, achievement_id in enumerate(achievement_ids):
            data[index]["totals"].append(totals[achievement_id])

        current_date += datetime.timedelta(**delta)
        if by == "month":
            current_date.replace(day=1)

    return (data,times)

