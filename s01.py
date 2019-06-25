import bs4 as bs
import urllib.request

import numpy as np
import pandas as pd 
import matplotlib.pyplot as plt
import networkx as nx 

key_people = open("Key People.csv","r")


company = ""

G = nx.Graph()

people_dict = {}

# mid_people = {}


for line in key_people:

	if line.startswith('"'):
		company = line.split('"')[3]
		G.add_node(company)
		print(company)

	else:
		line_break = line.split(",")
		if line_break[1].startswith("https"):

			sauce = urllib.request.urlopen(line_break[1]).read()
			soup = bs.BeautifulSoup(sauce,'lxml')
			name = soup.find("h1", {"id": "firstHeading"}).text
			print(name)
			people_dict[name]=line_break[1]

			G.add_edge(company, name, color="r")

			bodyContent = soup.find("div", {"id": "bodyContent"})

			for link in bodyContent.find_all('a',href=True):
				full_link = "https://en.wikipedia.org" + link.get('href')
				for names, links in people_dict.items():
					if links == full_link:
						G.add_edge(name,names, color="b")

nx.write_gexf(G, "step1.gexf")
nx.draw(G,with_labels = True)
plt.show()
