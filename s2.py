import bs4 as bs
import urllib.request

import numpy as np
import pandas as pd 
import matplotlib.pyplot as plt
import networkx as nx 

key_people = open("Key People.csv","r")

the_700 =open("Chinese Executives.csv","r")

company = ""

G = nx.Graph()

people_dict = {}

mid_people = {}

for line in the_700:
	line_split = line.split(',')
	if (line_split[0]!='\n'):
		print(line_split)
		mid_people[line_split[0]] = line_split[1]

for line in key_people:

	if line.startswith('"'):
		company = line.split('"')[3]
		# G.add_node(company)
		print(company)

	else:
		line_break = line.split(",")
		if line_break[1].startswith("https"):

			sauce = urllib.request.urlopen(line_break[1]).read()
			soup = bs.BeautifulSoup(sauce,'lxml')
			name = soup.find("h1", {"id": "firstHeading"}).text
			print(name)
			mid_people.pop(name, None)
			people_dict[name]=line_break[1]

			# G.add_edge(company, name)

			bodyContent = soup.find("div", {"id": "bodyContent"})

			for link in bodyContent.find_all('a',href=True):
				full_link = "https://en.wikipedia.org" + link.get('href')
				
				for mid_name, mid_link in mid_people.items():
					if mid_link!=line_break[1] and mid_link == full_link:
						sauce2 = urllib.request.urlopen(mid_link).read()
						soup2 = bs.BeautifulSoup(sauce2,'lxml')
						# name_Mid = soup2.find("h1", {"id": "firstHeading"}).text

						bodyContent2 = soup2.find("div", {"id": "bodyContent"})

						for last_link in bodyContent2.find_all('a',href=True):
							full_link2 = "https://en.wikipedia.org" + last_link.get('href')
							for dest_name, dest_link in people_dict.items():
								if dest_link == full_link2 and name!= mid_name and mid_name!=dest_name and name!=dest_name :
									print(name, "knows", mid_name, "knows", dest_name)
									G.add_node(mid_name, type="Intermediary")
									G.add_edge(name, mid_name, color="g")
									G.add_edge(mid_name, dest_name, color="g")
									



nx.write_gexf(G, "step2 chinese.gexf")
nx.draw(G,with_labels = True)
plt.show()
