from collections import namedtuple
from datetime import datetime, timedelta
from functools import reduce

import csv
import pdb

PAY_DAY = 15

def get_month_commencing(date, payday):
    delta_days = date.day + payday
    if date.day >= payday:
        delta_days = date.day - payday
    return date - timedelta(days=delta_days)

def get_account_id(account_name):
    try:
        account_name_map = {
                '\'K MR BAMFORTH' : 2,
                '\'Bills Account': 3,
                '\'Savings Account': 9
                }
        return account_name_map[account_name]
    except KeyError:
        print('Failed to get account id for name {}.'.format(account_name))
        raise

def get_date(date_str):
    try:
        return datetime.strptime(date_str, '%d/%m/%Y')
    except ValueError:
        return datetime.strptime(date_str, '%d %b %Y')
    except:
        print('Failed to parse date {}.'.format(date_str))
        raise

def get_value(value_str):
    try:
        return float(value_str)
    except ValueError:
        print('Could not get float from string "{}"'.format(value_str))
        raise

def get_expenditure_for_balance_row(balance_row):
    def fn(acc, row):
        try:
            return acc + get_value(row[' Value'])
        except:
            return acc
    return reduce(fn, sorted(balance_row, key=lambda x: x['Date']), 0)

if __name__ == '__main__':
    BalanceRow = namedtuple('BalanceRow', ['month_commencing', 'account_id'])
    balance_rows = {}

    with open('import.csv', 'rb') as csvfile:
        csvreader = csv.DictReader(csvfile, delimiter=',')
        for row in csvreader:
            try:
                date = get_date(row['Date'])
                key = BalanceRow(
                        get_month_commencing(date, PAY_DAY),
                        get_account_id(row[' Account Name'])
                        )
                try:
                    balance_rows[key].append(row)
                except KeyError:
                    balance_rows[key] = [row]
            except:
                continue

        print('\n'.join(['{}\t{}\t\t{}'.format(
            x.month_commencing.strftime('%Y-%m-%d'),
            x.account_id,
            get_expenditure_for_balance_row(balance_rows[x])) for x in sorted(
                balance_rows, key=lambda k: k[0]
            )]))
