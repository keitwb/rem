"""
Logic for converting BeautifulSoup4 table tags to dictionaries
"""

from typing import Any, Dict, List


def parse_simple_vertical_table(table):
    """
    Converts a simple Nx2 table to a dictionary.  The first column of each row is treated as the key
    and the second column as the value.

    :params table: A BeautifulSoup4 table tag
    """
    tds = [row.find_all("td") for row in table.find_all("tr") if len(row.find_all("td")) > 0]
    return {td[0].text.strip(): td[1].text.strip() for td in tds if len(td) > 1}


def parse_simple_horizontal_table(table, skip_columns=0, skip_rows=0):
    """
    Converts a simple 2xN table to a dictionary.  The columns of the first row are treated as the
    keys.
    """
    tds = [row.find_all(["td", "th"])[skip_columns:] for row in table.find_all("tr")[skip_rows:]]
    return {tds[0][i].text.strip(): tds[1][i].text.strip() for i in range(0, len(tds[0]))}


def parse_horizontal_table(table, skip_columns=0, skip_rows=0) -> List[Dict]:
    """
    Converts an NxM table where the first row is the headers and the subsequent rows are data.
    """
    tds = [row.find_all(["td", "th"])[skip_columns:] for row in table.find_all("tr")[skip_rows:]]
    if len(tds) <= 1:
        return []

    headers = [td.text.strip() for td in tds[0]]

    return [
        {headers[i]: td[skip_columns + i].text.strip() for i in range(0, len(td))}
        for td in tds[skip_rows + 1 :]
        if "".join([t.text for t in td])  # Exclude blank rows
    ]


def parse_2d_table(table, skip_columns=0, skip_rows=0, transpose=False) -> Dict[str, Dict[str, Any]]:
    """
    Takes a 2d table and converts it to a dictionary of dictionaries.  E.g.

       | x |  y  | z |
    ------------------
     a | 1 |  2  | 3 |
     b | 4 |  5  | 6 |
     c | 7 |  8  | 9 |

     Would get converted to: {
       "a": {"x": 1, "y": 2, "z": 3},
       "b": {"x": ....
     }

    """
    tds = [row.find_all(["td", "th"])[skip_columns:] for row in table.find_all("tr")[skip_rows:]]
    column_headers = [td.text.strip() for td in tds[skip_rows][skip_columns + 1 :]]
    row_headers = [row[skip_columns].text.strip() for row in tds[skip_rows + 1 :]]
    return (transpose_nested_dicts if transpose else lambda x: x)(
        {
            row_headers[i - 1]: {
                column_headers[j - 1]: tds[i][j].text.strip() for j in range(1 + skip_columns, len(tds[i]))
            }
            for i in range(skip_rows + 1, len(tds))
        }
    )


def transpose_nested_dicts(di):
    """
    Converts a dict whose values are also dicts to a dictionary whose keys are the set of keys from
    all of the originally nested dicts and whose values are dicts whose keys are the original di's
    top-level keys.

    E.g.

    {"a": {"x": 1, "y": 2}, "b": {"x": 3, "y": 4}}
    ---->
    {"x": {"a": 1, "b": 3}, "y": {"a": 2, "b": 4"}}
    """
    return {
        k: {nk: v.get(k) for nk, v in di.items()} for k in [k2 for val in di.values() for k2 in val.keys()]
    }
