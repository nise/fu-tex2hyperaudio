library(ggplot2)
getwd()


library(ggplot2)
getwd()
tab <- read.table("./text-analysis-all.csv", header=TRUE, sep=",")

ggplot(tab, aes(x=flesh, y = words)) + 
  geom_point(na.rm=TRUE, size=1) + #, alpha = 0.2
  facet_grid(document ~ .) +
  labs(title="", x="Flesh Lesbarkeitsindex", y='Worte pro Satz') +
  theme_bw() +
    theme(panel.background = element_rect(colour = "white", linetype = "dashed")) +
    theme(legend.key = element_rect(colour = "white", size=1)) +
    theme(legend.key.size = unit(4, "mm")) +
    theme(legend.position="bottom") +
    theme(panel.border = element_rect(colour = "white")) +
    theme(strip.background = element_rect(colour = "white", fill = "white", size = 0)) 
    #theme(strip.text.x = element_text(colour = "black", angle = 90, size = 9, hjust = .5, vjust = 0)) +
    #theme(axis.ticks.x = element_line(colour="white")) +
    #theme(axis.text.y = element_text(colour = "black", size = 9)) +
    #theme(axis.text.x = element_text(colour = "white", size = 0))

 

getOption("bitmapType")
options(bitmapType="cairo")
sessionInfo()
capabilities("Cairo")


library('Cairo')
