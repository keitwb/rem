import pytest

from bs4 import BeautifulSoup

from remtaxinfo.util.tables import parse_2d_table, transpose_nested_dicts


@pytest.mark.parametrize(
    "html,transpose,expected",
    [
        (
            """
            <table>
            <tr><th>Tax Year: 2018 </th><th>Applied </th><th>Paid </th><th>Owed</th></tr>
            <tr><td<b>     Tax:</b></td>
            <td>        540.17</td>
            <td>        540.17</td>
            <td>          0.00</td></tr>
            <tr><td<b>    Sass:</b></td>
            <td>         72.00</td>
            <td>         72.00</td>
            <td>          0.00</td></tr>
            <tr><td<b>    Fees:</b></td>
            <td>          0.00</td>
            <td>          0.00</td>
            <td>          0.00</td></tr>
            <tr><td<b>Interest:</b></td>
            <td>          0.00</td>
            <td>          0.00</td>
            <td>          0.00</td></tr>
            <tr><td><b>   Total:</b></td>
            <td>        612.17</td>
            <td>        612.17</td>
            <td>          0.00</td></tr>
            </table>
            """,
            False,
            {
                "Tax:": {"Applied": "540.17", "Paid": "540.17", "Owed": "0.00"},
                "Sass:": {"Applied": "72.00", "Paid": "72.00", "Owed": "0.00"},
                "Fees:": {"Applied": "0.00", "Paid": "0.00", "Owed": "0.00"},
                "Interest:": {"Applied": "0.00", "Paid": "0.00", "Owed": "0.00"},
                "Total:": {"Applied": "612.17", "Paid": "612.17", "Owed": "0.00"},
            },
        ),
        (
            """
            <table>
            <tr><th>Tax Year: 2018 </th><th>Applied </th><th>Paid </th><th>Owed</th></tr>
            <tr><td<b>     Tax:</b></td>
            <td>        540.17</td>
            <td>        540.17</td>
            <td>          0.00</td></tr>
            <tr><td<b>    Sass:</b></td>
            <td>         72.00</td>
            <td>         72.00</td>
            <td>          0.00</td></tr>
            <tr><td<b>    Fees:</b></td>
            <td>          0.00</td>
            <td>          0.00</td>
            <td>          0.00</td></tr>
            <tr><td<b>Interest:</b></td>
            <td>          0.00</td>
            <td>          0.00</td>
            <td>          0.00</td></tr>
            <tr><td><b>   Total:</b></td>
            <td>        612.17</td>
            <td>        612.17</td>
            <td>          0.00</td></tr>
            </table>
            """,
            True,
            {
                "Applied": {
                    "Tax:": "540.17",
                    "Sass:": "72.00",
                    "Fees:": "0.00",
                    "Interest:": "0.00",
                    "Total:": "612.17",
                },
                "Paid": {
                    "Tax:": "540.17",
                    "Sass:": "72.00",
                    "Fees:": "0.00",
                    "Interest:": "0.00",
                    "Total:": "612.17",
                },
                "Owed": {
                    "Tax:": "0.00",
                    "Sass:": "0.00",
                    "Fees:": "0.00",
                    "Interest:": "0.00",
                    "Total:": "0.00",
                },
            },
        ),
    ],
)
def test_parse_2d_table(html, transpose, expected):
    assert parse_2d_table(BeautifulSoup(html, features="lxml"), transpose=transpose) == expected


def test_transpose_nested_dicts():
    assert transpose_nested_dicts({"a": {"x": 1, "y": 2}, "b": {"x": 3, "y": 4}}) == {
        "x": {"a": 1, "b": 3},
        "y": {"a": 2, "b": 4},
    }
