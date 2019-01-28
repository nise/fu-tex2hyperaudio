library(ggplot2)
install.packages("Cairo")
getwd()
tab <- read.table("./output/text-analysis-all.csv", header=TRUE, sep=",")

plot <- ggplot(tab, aes(x=flesh, y = words, shape = factor(selected), color=factor(document))) + 
    geom_point(na.rm=TRUE, size=2, , alpha = 0.2) + #, alpha = 0.2
    labs(title="Lesbarkeit", x="Flesh Index", y='Words per sentence')

print(plot)