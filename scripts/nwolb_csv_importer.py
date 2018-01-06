from collections import namedtuple
from datetime import datetime, timedelta

import csv
import pdb

PAY_DAY = 15

def get_month_commencing(date, payday):
    delta_days = date.day + payday
    if date.day >= payday:
        delta_days = date.day - payday
    return date - timedelta(days=delta_days)

def get_account_id(account_name):
    account_name_map = {
            '\'Bills Account': 3,
            '\'Savings Account': 9
            }
    return account_name_map[account_name]

if __name__ == '__main__':
    BalanceRow = namedtuple('BalanceRow', ['month_commencing', 'account_id'])
    balance_rows = {}

    with open('import.csv', 'rb') as csvfile:
        csvreader = csv.DictReader(csvfile, delimiter=',')

        for row in csvreader:
            date = datetime.strptime(row['Date'], '%d/%m/%Y')
            value = float(row[' Value'])
            key = BalanceRow(
                    get_month_commencing(date, PAY_DAY),
                    get_account_id(row[' Account Name'])
                    )
            try:
                balance_rows[key]['expenditure'] += value
            except KeyError:
                balance_rows[key] = {'expenditure': value}

        print('\n'.join(['{}\t{}\t{}'.format(
            x.account_id,
            x.month_commencing.strftime('%Y-%m-%d'),
            balance_rows[x]['expenditure']) for x in sorted(
                balance_rows, key=lambda k: k[0], reverse=True)
            ]))
