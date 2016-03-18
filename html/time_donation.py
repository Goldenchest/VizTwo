import csv
import json
from datetime import datetime

def main():

    time = {}
    time_cat = {} # Environment, Games, Fashion, Technology, Sports

    with open("../../data/viztwo_data.csv", "r") as data:
        reader = csv.reader(data)
        for row in reader:
            if (row[1] == "Fund Project"):
                fdate = datetime.fromtimestamp(int(row[8]))
                day = fdate.weekday() + 1
                hr = fdate.hour + 1
                amt = int(row[7])
                if (day,hr) in time:
                    time[(day,hr)] = time[(day,hr)] + amt                
                else:
                    time[(day,hr)] = amt
                    time_cat[(day, hr)] = [0,0,0,0,0]

                if (row[0] == "Environment"):
                    time_cat[(day, hr)][0] += amt
                elif (row[0] == "Games"):
                    time_cat[(day, hr)][1] += amt
                elif (row[0] == "Fashion"):
                    time_cat[(day, hr)][2] += amt
                elif (row[0] == "Technology"):   
                    time_cat[(day, hr)][3] += amt
                else:
                    time_cat[(day, hr)][4] += amt

    # min = 3512
    # max = 6955
    with open('time_donation.csv', 'wb') as td:
        writer = csv.writer(td)
        writer.writerow(["day", "hour", "amt", "e_amt", "g_amt", "f_amt", "t_amt", "s_amt"])

        for t,a in sorted(time):                    
            writer.writerow([t, a, time[(t,a)], time_cat[(t,a)][0], time_cat[(t,a)][1], time_cat[(t,a)][2], time_cat[(t,a)][3], time_cat[(t,a)][4]])

if __name__ == "__main__":
    main()
 

